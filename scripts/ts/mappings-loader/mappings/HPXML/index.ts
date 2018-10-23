import * as util from 'util';
import * as XLSX from 'xlsx';
import { BedesMappingBase } from "../base/mappings-base";
import { createLogger }  from "@script-common/logging";
import { BedesRow } from './bedes-row';
import { getCellValue } from '@script-common/excel';
import { AppRow } from './app-row-hpxml';
import { IBedesTerm, IBedesTermConstrainedList } from '@bedes-common/bedes-term';
import { bedesQuery } from '@script-common/queries';
const logger = createLogger(module);

export class BedesMappingLabel {
    constructor(
        public termName: string,
        public value: string
    ) {
    }

    /**
     * Determines if the mapping is to a particular value
     * in a constrained list, in which case the value
     * string would not equal "[value]".
     * @returns true if enumerated value 
     */
    public isEnumeratedValue(): boolean {
        return this.value !== '[value]';
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

    protected async processWorksheet(sheetName: string): Promise<any> {
        logger.debug(`${this.constructor.name}: process ${sheetName}`);
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
        let appRow = this.getAppRowItem(sheet, row);
        let bedesRow = this.getBedesRowItem(sheet, row);
        // loop until an empty row is encountered
        while (!appRow.isEmpty() || !bedesRow.isEmpty()) {
            logger.debug(`row ${row}`);
            logger.debug(util.inspect(appRow));
            logger.debug(util.inspect(bedesRow));
            // app and bedes terms are ready to link
            if (bedesRow.isStartOfNewTerm()) {
                logger.debug(`beginning of new term`);
                if (bedesRowCollector.length) {
                    await this.linkTerms(appRowCollector, bedesRowCollector);
                }
                // reset the collectors to start reading a new term
                appRowCollector.splice(0, appRowCollector.length);
                bedesRowCollector.splice(0, bedesRowCollector.length);
            }
            // store the terms if they're not empty
            // link the terms when at the start of a new term
            if (!appRow.isEmpty()) {
                appRowCollector.push(appRow);
            }
            if (!bedesRow.isEmpty()) {
                bedesRowCollector.push(bedesRow);
            }

            // move to the next row
            row++;
            appRow = this.getAppRowItem(sheet, row);
            bedesRow = this.getBedesRowItem(sheet, row);
        }


    }

    /**
     * Links an apps terms to bedes terms
     * @param appRows 
     * @param bedesRows 
     */
    private async linkTerms(appRows: Array<AppRow>, bedesRows: Array<BedesRow>): Promise<any> {
        let bedesTerms = await this.getBedesTerms(bedesRows);
        logger.debug('found bedes terms');
        logger.debug(util.inspect(bedesTerms));
    }

    private async getBedesTerms(bedesRows: Array<BedesRow>): Promise<Array<IBedesTerm | IBedesTermConstrainedList>> {
        let bedesTerms = new Array<IBedesTerm | IBedesTermConstrainedList>();
        let promises = new Array<Promise<any>>();
        while (bedesRows.length) {
            let bedesRow = bedesRows.shift();
            if (bedesRow && bedesRow.bedesMapping) {
                let mapping = this.parseBedesMappingText(bedesRow.bedesMapping);
                if (mapping) {
                    if (mapping.isEnumeratedValue()) {
                        promises.push(bedesQuery.terms.getConstrainedList(mapping.termName, mapping.value));
                    }
                    else {
                        promises.push(bedesQuery.terms.getRecordByName(mapping.termName));
                    }
                }
            }
        }
        try {
            bedesTerms = await Promise.all(promises);
        }
        catch (error) {
            logger.error('Error retrieving bedes terms from HPLX mapping text');
            logger.error(util.inspect(bedesRows));
            throw error;
        }
        return bedesTerms;
    }

    private parseBedesMappingText(mappingText: string): BedesMappingLabel | undefined {
        let results = mappingText.match(/(.*)=['"]?(.*[^'"])['"]?/);
        if (results && results.length === 3) {
            return new BedesMappingLabel(results[1], results[2]);
        }
    }

    /**
     * Returns a Row object, given the worksheet and row
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