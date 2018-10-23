import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as util from 'util';

/**
 * Base class for loading a bedes mapping workbook into the database.
 */
export abstract class BedesMappingBase {
    protected book!: XLSX.WorkBook;
    // Excel workbook path and location
    private filePath: string;
    private fileName: string;
    // Name of the application we're mapping
    protected applicationName: string;
    // arrays holding the names of sheets to process
    protected abstract sheetNames: Array<string>;
    // function to load data from a worksheet
    protected abstract processWorksheet(sheetName: string): Promise<any>;
    // function to load the names of the worksheets to process.
    protected abstract loadSheetNames(): void;

    constructor(filePath: string, fileName: string, applicationName: string) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.applicationName = applicationName;
    }

    /**
     * Run the mapping loader.
     */
    public async run(): Promise<any> {
        logger.debug(`Begin loading mappings for ${this.applicationName}`);
        logger.debug('open the workbook');
        this.openWorkbook();
        logger.debug(`opened workbook ${this.fileName}`);
        try {
            this.loadSheetNames();
        }
        catch (error) {
            logger.debug('Error loading sheet names');
            logger.error(util.inspect(error));
            throw error;
        }
        logger.debug(util.inspect(this.sheetNames));
        if (!this.sheetNames.length) {
            throw new Error('Sheet names have not been set. Set sheetNames[] with names of worksheets to process');
        }
        for (let sheetName of this.sheetNames) {
            logger.debug(`${this.constructor.name}: Process worksheet ${sheetName}`);
            await this.processWorksheet(sheetName);
            break;
        }
    }

    /**
     * Opens the workbook.
     */
    private openWorkbook(): void {
        try {
            this.book = XLSX.readFile(path.join(this.filePath, this.fileName));
        }
        catch (error) {
            logger.error('Error opening workbook in BedesMappingBase.run.');
            logger.error(util.inspect(error));
            throw error;

        }
    }

    /**
     * Retrieve's a XLSX.Sheet object from the current Workbook.
     * @param sheetName Name of the worksheet to process.
     * @returns XLSX.Worksheet
     */
    protected getWorksheet(sheetName: string): XLSX.WorkSheet | undefined {
        let sheet: XLSX.WorkSheet;
        try {
            sheet = this.book.Sheets[sheetName];
            return sheet;
        }
        catch (error) {
            logger.error(`Worksheet ${sheetName} doesn't exist.`);
        }
    }
}
