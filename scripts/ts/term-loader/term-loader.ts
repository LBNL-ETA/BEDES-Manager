import { logger } from "../logging";
import * as path from 'path';
import * as fs from 'fs';
import appRoot from 'app-root-path';
import * as XLSX from 'xlsx';
import * as util from 'util';
import { TermType } from '../../../bedes-common/enums';
import { getCellValue } from '../lib';
import { BedesUnitManager } from "../unit-manager";
import { BedesUnit } from "../../../bedes-common/bedes-unit";
import { BedesTerm, BedesConstrainedList, IBedesTermConstrainedList, IBedesTerm} from '../../../bedes-common/bedes-term';
import { WorksheetRow, IWorksheetRow } from '../worksheet-row';
import { BedesTermOption } from "../../../bedes-common/bedes-term-option/bedes-term-option";
import { IBedesTermOption } from "../../../bedes-common/bedes-term-option/bedes-term-option.interface";

/**
 * Load's the BEDES terms from the BEDES V2.1_0.xlsx file.
 */
export class TermLoader {
    private filePath: string;
    private fileName: string;
    private unitManager: BedesUnitManager;

    private book!: XLSX.WorkBook;

    constructor(filePath: string, fileName: string) {
        logger.debug(`file exists = ${fs.existsSync(path.join(filePath, fileName))}`);
        this.filePath = filePath;
        this.fileName = fileName;
        this.unitManager = new BedesUnitManager();
    }

    /**
     * Runs term loader.
     */
    public run(): void {
        this.openBook();
        this.loadGlobalTerms();
    }

    /**
     * Opens the Workbook.
     */
    private openBook(): void {
        this.book = XLSX.readFile(path.join(this.filePath, this.fileName));
    }

    /**
     * Load the Global Terms worksheet.
     * @returns global terms 
     */
    private async loadGlobalTerms(): Promise<any> {
        // return new Promise((resolve, reject) => {
        const sheetName = 'Global Terms';
        const sheet = this.book.Sheets[sheetName];
        logger.debug('begin loading global terms...');

        let ref = XLSX.utils.encode_cell({c: 0, r: 0});
        let value = getCellValue(sheet[ref]);
        logger.debug(`cell value = ${value}`);
        // let rowNumber = 0;
        let row = 1;
        let rowItem = this.getRowItem(sheet, row++);
        // boolean indicating if currently processing the options
        // of a constrained list
        let inConstrainedList = false;
        // create a variable to holds the current BedesTerm object
        // can also be a BedesConstrainedList object.
        let currentTerm: BedesTerm | undefined;

        while (!rowItem.isEmpty()) {
            logger.debug(util.inspect(rowItem));
            // check if we need to process a new constrained list
            if (rowItem.isStartOfDefinition()) {
                if (currentTerm) {
                    logger.debug('current term');
                    logger.debug(util.inspect(currentTerm));
                }
                // start of a new term, do we create a regular BedesTerm or ConstrainedList
                if (rowItem.dataType && rowItem.dataType.match(/constrained list/i)) {
                    // start of a constrained list definition
                    inConstrainedList = true;
                    const params = <IBedesTermConstrainedList>{
                        _id: null,
                        _termTypeId: TermType.Global,
                        _name: rowItem.term,
                        _description: rowItem.definition,
                        _dataTypeId: 1
                    }
                    currentTerm = new BedesConstrainedList(params);
                    logger.debug('created constrained list');
                    logger.debug(currentTerm);
                }
                else {
                    // A reguar BedesTerm, not a ConstrainedList
                    inConstrainedList = false;
                    const params = <IBedesTerm>{
                        _termTypeId: TermType.Global,
                        _name: rowItem.term,
                        _description: rowItem.definition,
                        _dataTypeId: 1
                    }
                    currentTerm = new BedesTerm(params);
                    if (rowItem.dataType) {
                        let bedesUnit = await this.getBedesUnit(rowItem.dataType);
                        console.log(`bedes unit for ${rowItem.dataType}`);
                        console.log(util.inspect(bedesUnit));
                    }
                    logger.debug('created regular BedesTerm');
                    logger.debug(currentTerm);
                }
            }
            else if (currentTerm instanceof BedesConstrainedList) {
                // if currentTerm is already a BedesConstrainedList,
                // then must be a List Option.
                const params = <IBedesTermOption>{
                    _name: rowItem.dataType,
                    _description: rowItem.definition
                };
                currentTerm.addOption(new BedesTermOption(params));
            }
            else if (rowItem.isSectionTitle()) {
                // we stopped at a row that's a title for a section of terms
                // ignore
                console.debug(`processing section ${rowItem.term}`);
            }
            else {
                // Error state, should never reach here
                logger.error(`${this.constructor.name}: Invaild state parsing BedesTerms`);
                logger.error(util.inspect(currentTerm));
                logger.error(rowItem);
                logger.error(`at row ${row}`);
                throw new Error(`${this.constructor.name}: Invalid state parsing BedesTerms`);
            }
            rowItem = this.getRowItem(sheet, row++);
        }
        // });
        logger.debug('done parsing terms');
    }

    /**
     * Get the BedesUnit object for the given name.
     * If the name doesn't exist it should be created.
     * @param unitName 
     * @returns bedes unit 
     */
    private async getBedesUnit(unitName: string): Promise<BedesUnit> {
        let bedesUnit: BedesUnit | undefined;
        try {
            let item = await this.unitManager.getOrCreateItem(unitName);
            if (item) {
                return item;
            }
            else {
                throw new Error(`Unable to get the bedes unit ${unitName}`);
            }
        }
        catch (error) {
            logger.error('Error retrieving BedesUnit record');
            logger.error(util.inspect(error));
            throw error;
        }
        logger.debug('found bedesUnit');
        logger.debug(util.inspect(bedesUnit));
    }

    /**
     * Returns a Row object, given the worksheet and row
     * @param sheet 
     * @param row Zero based row number.
     * @returns row item 
     */
    private getRowItem(sheet: XLSX.Sheet, row: number): WorksheetRow {
        let col = 0;
        return new WorksheetRow({
            term: getCellValue(sheet[XLSX.utils.encode_cell({c: col++, r: row})]),
            definition: getCellValue(sheet[XLSX.utils.encode_cell({c: col++, r: row})]),
            dataType: getCellValue(sheet[XLSX.utils.encode_cell({c: col++, r: row})]),
            unit: getCellValue(sheet[XLSX.utils.encode_cell({c: col++, r: row})]),
            definitionSource: getCellValue(sheet[XLSX.utils.encode_cell({c: col++, r: row})]),
        });
    }
}
