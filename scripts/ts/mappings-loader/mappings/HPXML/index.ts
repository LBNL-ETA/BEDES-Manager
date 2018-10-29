import * as util from 'util';
import * as XLSX from 'xlsx';
import { BedesMappingBase } from "../base/mappings-base";
import { createLogger }  from "@script-common/logging";
import { BedesRow } from './bedes-row';
import { getCellValue } from '@script-common/excel';
import { AppRow } from './app-row-hpxml';
import { IBedesTerm, IBedesConstrainedList } from '@bedes-common/bedes-term';
import { AppTerm, IAppTerm, IAppTermAdditionalInfo } from '@bedes-common/app-term';
import { bedesQuery } from '@script-common/queries';
import { AppField } from '@bedes-common/enums';
import { IMappedTerm, IAppTermMap, IBedesTermMap } from '@bedes-common/mapped-term';
const logger = createLogger(module);

export class BedesMappingLabel {
    constructor(
        public termName: string,
        public value: string
    ) {
    }

}

export class HpxmlLoader extends BedesMappingBase {
    protected sheetNames!: Array<string>;

    constructor(filePath: string, fileName: string) {
        super(filePath, fileName, "HPXML");
    }

    /**
     * Set's the worksheet names to process
     */
    protected loadSheetNames(): void {
        this.sheetNames = new Array<string>();
        for (let name of this.book.SheetNames) {
            if (name.match(/^B\.\d+/)) {
                this.sheetNames.push(name);
            }
        }
    }

    /**
     * Loads the application terms, and links to BedesTerms
     * in the given XLSX.Sheet.
     * @param sheetName 
     * @returns worksheet 
     */
    protected async processWorksheet(sheetName: string): Promise<any> {
        try {
            logger.info(`${this.constructor.name}: process ${sheetName}`);
            // get the worksheet form the base class function
            const sheet = this.getWorksheet(sheetName);
            if (!sheet) {
                throw new Error(`Error retrieving sheet ${sheetName} from workbook`);
            }

            // app terms and bedes terms span multiple rows
            // collect a set of terms and link them together
            let bedesRowCollector = new Array<BedesRow>();
            let appRowCollector = new Array<AppRow>();
            let row = 3;
            // build a function to retrieve the next set of terms from the sheet row
            const nextRowItems = (row: number): [AppRow, BedesRow] => {
                let appRow = this.getAppRowItem(sheet, row);
                let bedesRow = this.getBedesRowItem(sheet, row);
                // if (bedesRow.bedesTerm && bedesRow.bedesTerm.match(/no mapping/i)) {
                //     bedesRow.bedesTerm = ""; 
                // }
                return [appRow, bedesRow];
            };
            // get the first app/bedes rows
            let [appRow, bedesRow] = nextRowItems(row++);
            if (this.isHeaderRow(appRow, bedesRow)) {
                [appRow, bedesRow] = nextRowItems(row++);
            }
            // loop until an empty row is encountered
            while (!appRow.isEmpty() || !bedesRow.isEmpty()) {
                logger.debug(`row ${row}`);
                logger.debug(util.inspect(appRow));
                logger.debug(util.inspect(bedesRow));
                if (!this.isSectionHeader(appRow, bedesRow)) {
                    // app and bedes terms are ready to link
                    if (bedesRow.isStartOfNewTerm()) {
                        logger.debug(`beginning of new term`);
                        if (appRowCollector.length && bedesRowCollector.length) {
                            // link the app's term to the corresponding Bedes Terms
                            await this.linkTerms(appRowCollector, bedesRowCollector);
                        }
                        // reset the collectors to start reading a new term
                        appRowCollector.splice(0, appRowCollector.length);
                        bedesRowCollector.splice(0, bedesRowCollector.length);
                    }
                    // store the terms if they're not empty
                    // link the terms when at the start of a new term
                    if (!appRow.isEmpty() && !appRow.isSectionHeader()) {
                        appRowCollector.push(appRow);
                    }
                    if (!bedesRow.isEmpty() && (!bedesRow.bedesTerm || (bedesRow.bedesTerm && !bedesRow.bedesTerm.match(/no mapping/i)))) {
                        bedesRowCollector.push(bedesRow);
                    }
                }
                // move to the next row
                [appRow, bedesRow] = nextRowItems(row++);
            }
            // link the last term if exists
            if (bedesRowCollector.length && appRowCollector.length) {
                await this.linkTerms(appRowCollector, bedesRowCollector);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in processWorksheet`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Determines if a given row in a Worksheet is a header row.
     * @param appRow 
     * @param bedesRow 
     * @returns true if header row 
     */
    private isHeaderRow(appRow: AppRow, bedesRow: BedesRow): boolean {
        if (appRow.dataElement.toLowerCase() === 'data element'
        && bedesRow.bedesTerm.toLowerCase() === 'bedes term') {
            return true;
        }
        else {
            return false;
        }
    }

    private isSectionHeader(appRow: AppRow, bedesRow: BedesRow): boolean {
        if (
            (
                (appRow.appCode && appRow.appCode.match(/^B\d+\./i) && !appRow.dataElement)
                ||
                (appRow.dataElement && appRow.dataElement.match(/^B\d*\./i) && !appRow.appCode)
            ) && bedesRow.isEmpty()
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Links an apps terms to bedes terms.
     * @param appRows 
     * @param bedesRows 
     */
    private async linkTerms(appRows: Array<AppRow>, bedesRows: Array<BedesRow>): Promise<any> {
        try {
            logger.debug('link terms');
            logger.debug(util.inspect(appRows));
            logger.debug(util.inspect(bedesRows));
            let bedesTerms = await this.getBedesTerms(bedesRows);
            if (!bedesTerms.length) {
                logger.warn('bedes terms not found for appRow:');
                logger.warn(util.inspect(appRows));
                return;
            }
            let appTerms = this.buildAppTerms(appRows);
            if (!appTerms.length) {
                logger.warn('app terms not found for appRow:');
                logger.warn(util.inspect(appRows));
                return;
            }
            let savedAppTerms = await this.saveAppTerms(appTerms);
            logger.debug('app terms');
            logger.debug(util.inspect(bedesTerms));
            logger.debug(util.inspect(appTerms));
            return this.saveLinkedTerms(savedAppTerms, bedesTerms)
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in linkTerms`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appRows));
            logger.error(util.inspect(bedesRows));
            throw error;
        }
    }

    /**
     * Builds an array of AppTerm objects out of the given array of AppRow objects.
     * @param appRows 
     * @returns app terms 
     */
    private buildAppTerms(appRows: Array<AppRow>): Array<IAppTerm> {
        try {
            return appRows.map((appRow) => {
                const term = <IAppTerm>{
                    _appId: this.appId,
                    _fieldCode: appRow.appCode,
                    _name: appRow.dataElement,
                    _description: appRow.definition ? appRow.definition.trim() : null,
                    _additionalInfo: new Array<IAppTermAdditionalInfo>()
                };

                if (appRow.appCode) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.FieldCode,
                        _value: appRow.appCode
                    });
                }
                if (appRow.units) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.Units,
                        _value: appRow.units
                    });
                }
                if (appRow.dataType) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.DataType,
                        _value: appRow.dataType
                    });
                }
                if (appRow.enumeration) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.EnumeratedValue,
                        _value: appRow.enumeration
                    });
                }
                if (appRow.notes) {
                    term._additionalInfo.push(<IAppTermAdditionalInfo>{
                        _appFieldId: AppField.Notes,
                        _value: appRow.notes
                    });
                }

                return term;
            });
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in buildAppTerms`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async saveAppTerms(appTerms: Array<IAppTerm>): Promise<Array<IAppTerm>> {
        try {
            let promises = new Array<Promise<IAppTerm>>();
            appTerms.map((appTerm) => promises.push(bedesQuery.appTerm.newAppTerm(appTerm, this.transaction)));
            let results = Promise.all(promises);
            return results;
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error saving AppTerms`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Links the AppTerm objects in appTerms to the BedesTerm objects in bedesTerms.
     * @param appTerms 
     * @param bedesTerms 
     * @returns linked terms 
     */
    private async saveLinkedTerms(appTerms: Array<IAppTerm>, bedesTerms: Array<IBedesTerm>): Promise<any> {
        try {
            // create a new MappedTerm object
            let mappedTerm = <IMappedTerm>{
                _appId: this.appId,
                _appTerms: new Array<IAppTermMap>(),
                _bedesTerms: new Array<IBedesTermMap>()
            };
            // add the app terms, and set the name
            for (let appTerm of appTerms) {
                mappedTerm._appTerms.push(<IAppTermMap>{
                    _appTermId: appTerm._id,
                    _mappedTermId: undefined
                });
            }
            // add the bedes term, and set the bedes term name
            for (let bedesTerm of bedesTerms) {
                mappedTerm._bedesTerms.push(<IBedesTermMap>{
                    _bedesTermId: bedesTerm._id,
                    _mappedTermId: undefined
                });
            }
            let result = await bedesQuery.mappedTerm.newMappedTerm(mappedTerm, this.transaction);
            logger.debug('created mapped term');
            logger.debug(util.inspect(result));
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in saveLinkedTerms`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(appTerms));
            logger.error(util.inspect(bedesTerms));
            throw error;
        }
    }

    /**
     * Get the BedesTerms (or ConstrainedList) from the database, for the corresponding
     * BedesRow objects passed in.
     * @param bedesRows 
     * @returns bedes terms 
     */
    private async getBedesTerms(bedesRows: Array<BedesRow>): Promise<Array<IBedesTerm | IBedesConstrainedList>> {
        try {
            let promises = new Array<Promise<any>>();
            for (let bedesRow of bedesRows) {
                if (bedesRow && bedesRow.bedesMapping) {
                    let mappings = this.parseBedesMappingText(bedesRow.bedesMapping);
                    if (!mappings) {
                        continue;
                    }
                    for (let mapping of mappings) {
                        if (mapping) {
                            logger.debug(`is ${mapping.termName} constrained list`);
                            let result = await bedesQuery.terms.isConstrainedList(mapping.termName);
                            logger.debug(`result = ${result}`);
                            if (result) {
                                // if constrained list, and [value], then this is a custom value for the list
                                if (mapping.value === '[value]') {
                                    mapping.value = 'Custom';
                                }
                                promises.push(bedesQuery.terms.getConstrainedList(mapping.termName, mapping.value, this.transaction));
                            }
                            else {
                                promises.push(bedesQuery.terms.getRecordByName(mapping.termName, this.transaction));
                            }
                        }
                    }
                }
            }
            let results = Promise.all(promises);
            return results;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getBedesTerms`);
            logger.error(util.inspect(error));
            logger.error(`couldn't find matching bedes terms`);
            logger.error(util.inspect(bedesRows));
            throw error;
        }
    }

    /**
     * Parses the bedes mapping text, which lists the Bedes Term name,
     * along with the value.
     * @param mappingText 
     * @returns bedes mapping text 
     */
    private parseBedesMappingText(mappingText: string): Array<BedesMappingLabel> | undefined {
        if (!mappingText) {
            return undefined;
        }
        let terms = mappingText.split(/\n/);
        let labels = new Array<BedesMappingLabel>();
        terms.forEach((mappingText) => {
            if (mappingText && mappingText.trim()) {
                let results = mappingText.match(/(.*[^ ]) ?= ?['"]?(.*[^'"])['"]?/);
                if (results && results.length === 3) {
                    labels.push(new BedesMappingLabel(results[1], results[2]));
                }
                else {
                    logger.debug(`invalid BedesMappingLabel`);
                    logger.debug(mappingText);
                    throw new Error('Invalid BedesMappingLabel');
                }
            }
        });
        return labels;
    }

    /**
     * Returns a AppRow object, given the worksheet and row
     * @param sheet 
     * @param row Zero based row number.
     * @returns row item 
     */
    private getAppRowItem(sheet: XLSX.Sheet, row: number): AppRow {
        const item = new AppRow(
            getCellValue(sheet[`A${row}`]),
            getCellValue(sheet[`B${row}`]),
            getCellValue(sheet[`C${row}`]),
            getCellValue(sheet[`D${row}`]),
            getCellValue(sheet[`E${row}`]),
            getCellValue(sheet[`F${row}`]),
            getCellValue(sheet[`G${row}`]),
        );
        return item;
    }

    /**
     * Returns a BedesRow object given a Sheet row.
     * @param sheet 
     * @param row The row number from which to pull the Bedes data from.
     * @returns The Bedes term info from the row.
     */
    private getBedesRowItem(sheet: XLSX.Sheet, row: number): BedesRow {
        const item = new BedesRow(
            getCellValue(sheet[`H${row}`]),
            getCellValue(sheet[`I${row}`]),
            getCellValue(sheet[`J${row}`])
        );
        return item;
    }


}