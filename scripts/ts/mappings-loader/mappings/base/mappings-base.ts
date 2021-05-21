import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as util from 'util';
import { bedesQuery } from "@bedes-backend/bedes/query";
import { IMappingApplication } from "@bedes-common/models/mapping-application";
import { db } from '@bedes-backend/db';
import { BedesErrorTermNotFound } from '@bedes-common/errors/bedes-term-not-found.error';
import { BedesError } from "@bedes-common/bedes-error";
import { TermNotFound } from './term-not-found';
import { TermsNotFoundSheet } from './terms-not-found-sheet';
import { AppRow } from '../HPXML/app-row-hpxml';

/**
 * Base class for loading a bedes mapping workbook into the database.
 */
export abstract class BedesMappingBase {
    // The current database transaction context
    protected transaction: any;
    protected book!: XLSX.WorkBook;
    // Excel workbook path and location
    private filePath: string;
    private fileName: string;
    // Name of the application we're mapping
    protected applicationName: string;
    // arrays holding the names of sheets to process
    protected abstract sheetNames: Array<string>;
    // function to load data from a worksheet
    protected abstract processWorksheet(sheetName: string): Promise<Array<TermNotFound>>;
    // function to load the names of the worksheets to process.
    protected abstract loadSheetNames(): void;
    //
    protected appId: number | null | undefined;

    constructor(filePath: string, fileName: string, applicationName: string) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.applicationName = applicationName;
    }

    /**
     * Run the mapping loader.
     */
    public async run(): Promise<any> {
        try {
            const runFunction = async (transaction: any) => {
                const allTermsNotFound = new Array<TermsNotFoundSheet>();
                this.transaction = transaction;
                logger.info(`Begin loading mappings for ${this.applicationName}`);
                logger.debug('open the workbook');
                // set the application_id for the class
                // id must be set to link the terms in the database,
                // so wait for the promise to resolve
                await this.setAppId();
                this.openWorkbook();
                logger.debug(`opened workbook ${this.fileName}`);
                this.loadSheetNames();
                logger.debug(util.inspect(this.sheetNames));
                if (!this.sheetNames.length) {
                    // throw an error if sheet names haven't been set
                    throw new Error('Sheet names have not been set. Set sheetNames[] with names of worksheets to process');
                }
                for (let sheetName of this.sheetNames) {
                    logger.debug(`${this.constructor.name}: Process worksheet ${sheetName}`);
                    let termsNotFound = await this.processWorksheet(sheetName);
                    if (termsNotFound && termsNotFound.length) {
                        allTermsNotFound.push(new TermsNotFoundSheet(sheetName, termsNotFound));
                    }
                }
                if (allTermsNotFound.length) {
                    // some BEDES terms were not found
                    this.displayTermNotFoundErrors(allTermsNotFound);
                    
                }

            }
            return db.tx('bedes-trans', runFunction);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in run`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private displayTermNotFoundErrors(termsNotFound: Array<TermsNotFoundSheet>): void {
        const reducer = (accum: number, current: TermsNotFoundSheet): number => {
            return accum + current.termsNotFound.length;
        }
        const numErrors = termsNotFound.reduce(reducer, 0);
        console.log(`\nFound total ${numErrors} invalid BedesTerm references:`);
        for (let bedesError of termsNotFound) {
            console.log(`BedesTerms not found in sheet ${bedesError.sheetName}`);
            bedesError.termsNotFound.forEach((item: TermNotFound) => {
                console.log(`\n\tBedesTerm: ${item.termName}`);
                item.appRows.forEach((appRow: AppRow) => {
                    console.log(`\tAppRow: ${appRow.appTermCode} - ${appRow.dataElement}`);
                });
            });
        }
    }

    /**
     * Sets the AppId for the given application.
     * Retrieves the id column from the table for the
     * subclassed application, creates a record if it doesn't
     * exist.
     */
    private async setAppId(): Promise<any> {
        try {
            let item: IMappingApplication;
            try {
                item = await bedesQuery.app.getRecord(this.applicationName);
                logger.debug('found existing app record');
                logger.debug(util.inspect(item));
            }
            catch {
                // @todo: Fix this. It needs a user, but we don't have a user in this context.
                // item = await bedesQuery.app.newRecord(<IMappingApplication>{_name: this.applicationName}, this.transaction);
                throw new Error("Can't set AppId; no user context.");
            }
            if (item) {
                this.appId = item._id;
            }
            else {
                logger.error(`Unable to set appid for ${this.applicationName}`);
                throw new Error(`Unable to set appid for ${this.applicationName}`);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in setAppId`);
            logger.error(util.inspect(error));
            throw error;
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
        try {
            return this.book.Sheets[sheetName];
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getWorksheet`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
