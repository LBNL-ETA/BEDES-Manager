import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as util from 'util';
import { getCellValue } from './excel/lib';
import { BedesUnitManager } from "./data-managers/unit-manager";
import { BedesUnit } from "@bedes-common/models/bedes-unit";
import { BedesTerm, BedesConstrainedList, IBedesConstrainedList, IBedesTerm } from '@bedes-common/models/bedes-term';
import { WorksheetRow } from './excel/worksheet-row';
import { BedesTermOption } from "@bedes-common/models/bedes-term-option/bedes-term-option";
import { IBedesTermOption } from "@bedes-common/models/bedes-term-option/bedes-term-option.interface";
import { BedesDataTypeManager } from "./data-managers/data-type-manager";
import { BedesDataType } from "@bedes-common/models/bedes-data-type";
import { BedesTermManager } from "./data-managers/bedes-term-manager";
import { BedesDefinitionSourceManager } from "./data-managers/definition-source-manager";
import { BedesTermTypeManager } from "./data-managers/term-type-manager";
import { BedesTermType } from "@bedes-common/models/bedes-term-type";
import { BedesDefinitionSource } from "@bedes-common/models/bedes-definition-source";

/**
 * Load's the BEDES terms from the BEDES V2.1_0.xlsx file.
 */
export class TermLoader {
    private filePath: string;
    private fileName: string;
    private unitManager: BedesUnitManager;
    private dataTypeManager: BedesDataTypeManager;
    private termManager: BedesTermManager;
    private definitionSourceManager: BedesDefinitionSourceManager;
    private termTypeManager: BedesTermTypeManager;

    private book!: XLSX.WorkBook;
    // list of sheet names to process
    private sheetNames = new Array<string>(
        'Global Terms',
        'Premises',
        'Contact',
        'Measures',
        'Envelope',
        'HVAC',
        'Loads',
        'Controls and Operations',
        'Generation and Storage Equipmen',
        'Resources',
        'Emissions',
        'Waste',
        'Units',
        'Metadata'
    );

    constructor(filePath: string, fileName: string) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.unitManager = new BedesUnitManager();
        this.dataTypeManager = new BedesDataTypeManager();
        this.termManager = new BedesTermManager();
        this.definitionSourceManager = new BedesDefinitionSourceManager();
        this.termTypeManager = new BedesTermTypeManager();
    }

    /**
     * Runs term loader.
     */
    public async run(): Promise<any>{
        this.openBook();
        for (let sheetName of this.sheetNames) {
            await this.loadTerms(sheetName);
        }
    }

    /**
     * Open the Workbook.
     */
    private openBook(): void {
        try {
            this.book = XLSX.readFile(path.join(this.filePath, this.fileName));
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in openBook opening ${this.filePath}/${this.fileName}`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    // private setWorksheets(): void {
    //     for (let name of this.book.SheetNames) {
    //         logger.debug(`Sheet ${name}`);
    //     }
    // }

    /**
     * Loads the terms for a given Excel Worksheet name.
     * @param sheetName The name of the Excel worksheet.
     * @returns void
     */
    private async loadTerms(sheetName: string): Promise<any> {
        try {
            const sheet = this.book.Sheets[sheetName];
            logger.debug(`begin loading terms in sheet ${sheetName}...`);
            // get the first row object
            let row = 1;
            let rowItem = this.getRowItem(sheet, row++);
            // create a variable to holds the current BedesTerm object
            // can also be a BedesConstrainedList object.
            let currentTerm: BedesTerm | undefined;
            // get the term type for this set of terms
            // corresponds to the worksheet names
            let termType = await this.getTermType(sheetName); 
            if (!termType || !termType.id) {
                logger.error(`Error creating term type for sheet name ${sheetName}`);
                throw new Error(`Invalid term type: ${sheetName}`);
            }
            // start looping through the rows
            // next row is read at the bottom of the loop
            // non-constrained-list terms are written as they are read
            // constrained-list terms span multiple rows, where the first
            // row is the list name and description, and all subsequent row
            // are options for the list.  Options continue until the current
            // sheet is finished, or starting a new term.
            while (!rowItem.isEmpty()) {
                // see if at start of a new bedes definition
                if (rowItem.isStartOfDefinition()) {
                    // check if we need to process a new constrained list
                    if (currentTerm instanceof BedesConstrainedList) {
                        // if at the start of a new definition, and currentTerm
                        // is a BedesConstrainedList, need to save it
                        await this.termManager.writeConstrainedList(currentTerm);
                        currentTerm = undefined;
                    }
                    // start of a new term, do we create a regular BedesTerm or ConstrainedList
                    if (rowItem.dataType && rowItem.dataType.match(/constrained list/i)) {
                        // start of a constrained list definition
                        currentTerm = await this.buildConstrainedList(termType.id, rowItem);
                    }
                    else {
                        // A reguar BedesTerm, not a ConstrainedList
                        currentTerm = await this.buildBedesTerm(termType.id, rowItem);
                        // can go ahead and write single terms
                        await this.termManager.writeTerm(currentTerm);
                        currentTerm = undefined;
                    }
                }
                else if (currentTerm instanceof BedesConstrainedList && rowItem.hasListOptionData()) {
                    // if currentTerm is already a BedesConstrainedList,
                    // then must be a List Option.
                    const newOption =  await this.buildBedesListOption(rowItem, currentTerm);
                    currentTerm.addOption(newOption);
                }
                else if (rowItem.isSectionTitle()) {
                    // we stopped at a row that's a subtitle for a section of terms, ignore
                    console.debug(`processing section ${rowItem.term}`);
                }
                else {
                    // Error state, should never reach here
                    logger.error(`${this.constructor.name}: Invaild state parsing BedesTerms`);
                    logger.error(util.inspect(currentTerm));
                    logger.error(rowItem);
                    logger.error(`at row ${row}`);
                    logger.error(`sheet ${sheetName}`);
                    throw new Error(`${this.constructor.name}: Invalid state parsing BedesTerms`);
                }
                // get the next row
                rowItem = this.getRowItem(sheet, row++);
            }

            logger.debug('done parsing terms');
            // write the bedes term if last item was a list option
            if (currentTerm instanceof BedesConstrainedList) {
                return this.termManager.writeConstrainedList(currentTerm);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: error loading terms in ${sheetName}`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async getTermType(sheetName: string): Promise<BedesTermType> {
        // get the term type for this set of terms
        // corresponds to the worksheet names
        try {
            return this.termTypeManager.getOrCreateItem(sheetName);
        }
        catch (error) {
            logger.error(`Error retrieving TermType ${sheetName}`);
            throw error;
        }
    }

    private async buildBedesTerm(termTypeId: number, rowItem: WorksheetRow): Promise<BedesTerm> {
        try {
            if (!rowItem.dataType) {
                throw new Error('Missing data type');
            }
            if (!rowItem.unit) {
                rowItem.unit = "n/a";
            }
            let dataType = await this.getBedesDataType(rowItem.dataType);
            let unit = await this.getBedesUnit(rowItem.unit);
            let definitionSourceId: number | undefined | null;
            if (rowItem.definitionSource) {
                let item = await this.getDefinitionSource(rowItem);
                definitionSourceId = item.id;
            }
            const params = <IBedesTerm>{
                _termTypeId: termTypeId,
                _name: rowItem.term,
                _description: rowItem.definition,
                _dataTypeId: dataType.id,
                _unitId: unit.id,
                _definitionSourceId: definitionSourceId
            }
            return new BedesTerm(params);
        }
        catch (error) {
            logger.error('error writing term');
            logger.error(util.inspect(rowItem))
            util.inspect(error);
            throw new Error('Unable to build BedesTerm');
        }
    }

    private async writeConstrainedList(currentTerm: BedesConstrainedList): Promise<any> {
        try {
            return this.termManager.writeConstrainedList(currentTerm);
        }
        catch (error) {
            logger.error('Error writing constrained list for currentt term:');
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async buildConstrainedList(termTypeId: number, rowItem: WorksheetRow): Promise<BedesConstrainedList> {
        try {
            if (!rowItem.unit) {
                rowItem.unit = "n/a";
            }
            // dataType must be present
            if (!rowItem.dataType) {
                throw new Error('Missing data type');
            }
            let promises = new Array<Promise<any>>();
            promises.push(this.getBedesDataType(rowItem.dataType));
            promises.push(this.getBedesUnit(rowItem.unit));
            // wait to for promises to resolve
            const [dataType, unit] = await Promise.all(promises);
            // start building the BedesConstrainedList object
            const params = <IBedesConstrainedList>{
                _id: null,
                _termTypeId: termTypeId,
                _name: rowItem.term,
                _description: rowItem.definition,
                _unitId: unit.id,
                _dataTypeId: dataType.id
            }
            let newTerm = new BedesConstrainedList(params);
            newTerm.loadOptions(await this.buildCommonListOptions());
            return newTerm;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in `);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async buildCommonListOptions(): Promise<Array<IBedesTermOption>> {
        let options = new Array<IBedesTermOption>();
        let unit = await this.getBedesUnit('n/a');
        if (!unit) {
            throw new Error('Couldnt find unit for n/a');
        }
        // Other
        options.push(<IBedesTermOption>{
            _id: undefined,
            _name: 'Other',
            _description: 'The term applies but none of the constrained list options are appropriate.',
            _unitId: unit.id,
            _definitionSourceId: undefined
        });
        // Unknown
        options.push(<IBedesTermOption>{
            _id: undefined,
            _name: 'Unknown',
            _description: 'The term applies, there is such a thing implemented, but which constrained list option is implemented is unknown.',
            _unitId: unit.id,
            _definitionSourceId: undefined
        });
        // None
        options.push(<IBedesTermOption>{
            _id: undefined,
            _name: 'None',
            _description: 'The term applies but there is no such thing implemented.',
            _unitId: unit.id,
            _definitionSourceId: undefined
        });
        // Not applicable
        options.push(<IBedesTermOption>{
            _id: undefined,
            _name: 'Not applicable',
            _description: 'The term does not apply.',
            _unitId: unit.id,
            _definitionSourceId: undefined
        });
        // Custom
        options.push(<IBedesTermOption>{
            _id: undefined,
            _name: 'Custom',
            _description: 'The term applies, there is such a thing implemented, but none of the constrained list options are appropriate, so a custom option is designated.',
            _unitId: unit.id,
            _definitionSourceId: undefined
        });
        return options;
    }

    private async buildBedesListOption(rowItem: WorksheetRow, currentTerm: BedesConstrainedList): Promise<BedesTermOption> {
        if (!rowItem.unit) {
            // set unit to n/a if it is blank
            rowItem.unit = "n/a";
        }
        if (!rowItem.dataType) {
            // TODO: throw an Error here?
            console.log('no name?');
        }
        let unit = await this.getBedesUnit(rowItem.unit);
        const params = <IBedesTermOption>{
            _name: rowItem.dataType,
            _description: rowItem.definition,
            _unitId: unit.id
        };
        return new BedesTermOption(params);
    }

    /**
     * Get the BedesUnit object for the given name.
     * If the name doesn't exist it should be created.
     * @param name 
     * @returns bedes unit 
     */
    private async getBedesUnit(name: string): Promise<BedesUnit> {
        try {
            let item = await this.unitManager.getOrCreateItem(name);
            if (item) {
                return item;
            }
            else {
                throw new Error(`Unable to get the bedes unit ${name}`);
            }
        }
        catch (error) {
            logger.error('Error retrieving BedesUnit record');
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async getBedesDataType(name: string): Promise<BedesDataType> {
        try {
            return this.dataTypeManager.getOrCreateItem(name);
        }
        catch (error) {
            logger.error('Error retrieving BedesDataType record');
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private async getDefinitionSource(rowItem: WorksheetRow): Promise<BedesDefinitionSource> {
        if (!rowItem.definitionSource) {
            logger.error('Error retrieving definition source');
            logger.error(util.inspect(rowItem));
            throw new Error('Missing row missing definition source');
        }
        try {
            return this.definitionSourceManager.getOrCreateItem(rowItem.definitionSource);
        }
        catch (error) {
            logger.error('Error building DefinitionSource for rowItem:');
            logger.error(util.inspect(rowItem));
            throw new Error('Error building BedesDefinitionSource.');
        }
    }

    /**
     * Returns a Row object, given the worksheet and row
     * @param sheet 
     * @param row Zero based row number.
     * @returns row item 
     */
    private getRowItem(sheet: XLSX.Sheet, row: number): WorksheetRow {
        let col = 0;
        let item = new WorksheetRow({
            term: getCellValue(sheet[XLSX.utils.encode_cell({ c: col++, r: row })]),
            definition: getCellValue(sheet[XLSX.utils.encode_cell({ c: col++, r: row })]),
            dataType: getCellValue(sheet[XLSX.utils.encode_cell({ c: col++, r: row })]),
            unit: getCellValue(sheet[XLSX.utils.encode_cell({ c: col++, r: row })]),
            definitionSource: getCellValue(sheet[XLSX.utils.encode_cell({ c: col++, r: row })]),
        });
        // if (item.term && !item.definition && !item.isSectionTitle()) {
        //     // set the definition to the term name if missing
        //     item.definition = item.term;
        // }
        return item;
    }
}
