import * as util from 'util';
import { BedesMappingBase } from "../base/mappings-base";
import { BedesRow } from './bedes-row';
import { AppRow } from './app-row-hpxml';
import { createLogger }  from "@script-common/logging";
import { TermLinker } from './term-linker';
import { ExcelRowExtractor } from './excel-row-extractor';
import { BedesErrorTermNotFound } from '../lib/errors/bedes-term-not-found.error';
import { BedesError } from '@bedes-common/bedes-error';
import { TermNotFound } from '../base/term-not-found';
const logger = createLogger(module);

export class HpxmlLoader extends BedesMappingBase {
    protected sheetNames!: Array<string>;
    private termLinker: TermLinker;
    private rowExtractor: ExcelRowExtractor;

    constructor(filePath: string, fileName: string) {
        super(filePath, fileName, "HPXML");
        this.termLinker = new TermLinker();
        this.rowExtractor = new ExcelRowExtractor();
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
    protected async processWorksheet(sheetName: string): Promise<Array<TermNotFound>> {
        const termNotFoundErrors = new Array<TermNotFound>();
        try {
            logger.info(`${this.constructor.name}: process ${sheetName}`);
            if (!this.appId) {
                throw new Error(`AppId has not been set for application ${this.applicationName}`);
            }
            // get the worksheet form the base class function
            const sheet = this.getWorksheet(sheetName);
            if (!sheet) {
                throw new Error(`Error retrieving sheet ${sheetName} from workbook`);
            }

            // set the database transaction contexts for the term processors and linker
            this.termLinker.setTransaction(this.transaction);
            // set the Excel Sheet object for the Row object iterator
            this.rowExtractor.setSheet(sheet);

            // app terms and bedes terms span multiple rows
            // collect a set of terms and link them together
            let bedesRowCollector = new Array<BedesRow>();
            let appRowCollector = new Array<AppRow>();

            // loop until an empty row is encountered
            for (let [appRow, bedesRow] of this.rowExtractor) {
                if (!appRow || !bedesRow) {
                    // this should never happen
                    // only way either of these are undefined are if both are undefined
                    // in which case the iterator exits.
                    throw new Error(`${this.constructor.name}: a problem occurred with the Excel row iterator.`);
                }
                logger.debug(util.inspect(appRow));
                logger.debug(util.inspect(bedesRow));
                if (bedesRow.isStartOfNewTerm() || this.isHeaderRow(appRow, bedesRow)) {
                    logger.debug(`beginning of new term`);
                    if (appRowCollector.length && bedesRowCollector.length) {
                        // link the app's term to the corresponding Bedes Terms
                        try {
                            await this.termLinker.linkTerms(this.appId, appRowCollector, bedesRowCollector);
                        }
                        catch (error) {
                            if (error instanceof BedesErrorTermNotFound) {
                                termNotFoundErrors.push(new TermNotFound(error.termName, [...appRowCollector]));
                            }
                            else {
                                logger.error('unknown error in linkTerms');
                                throw error;
                            }
                        }
                    }
                    // reset the collectors to start reading a new term
                    appRowCollector.splice(0, appRowCollector.length);
                    bedesRowCollector.splice(0, bedesRowCollector.length);
                }
                // ignore section and sheet header rows
                if (!this.isHeaderRow(appRow, bedesRow)) {
                    // app and bedes terms are ready to link
                    // store the terms if they're not empty
                    // link the terms when at the start of a new term
                    if (!appRow.isEmpty()) {
                        appRowCollector.push(appRow);
                    }
                    // if (!bedesRow.isEmpty() && (!bedesRow.bedesTerm || (bedesRow.bedesTerm && !bedesRow.bedesTerm.match(/no mapping/i)))) {
                    if (bedesRow.isValidBedesObject()) {
                        bedesRowCollector.push(bedesRow);
                    }
                }
            }
            // link the last term if exists
            if (bedesRowCollector.length && appRowCollector.length) {
                try {
                    await this.termLinker.linkTerms(this.appId, appRowCollector, bedesRowCollector);
                }
                catch (error) {
                    if (error instanceof BedesErrorTermNotFound) {
                        termNotFoundErrors.push(new TermNotFound(error.termName, [...appRowCollector]));
                    }
                    else {
                        logger.error('unknown error in linkTerms');
                        throw error;
                    }
                }
            }
            return termNotFoundErrors;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in processWorksheet`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    private isHeaderRow(appRow: AppRow, bedesRow: BedesRow): boolean {
        if (!this.isSectionHeader(appRow, bedesRow) && !this.isMainHeader(appRow, bedesRow)) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Determines if a given row in a Worksheet is a header row.
     * @param appRow 
     * @param bedesRow 
     * @returns true if header row 
     */
    private isMainHeader(appRow: AppRow, bedesRow: BedesRow): boolean {
        if (appRow.dataElement && appRow.dataElement.toLowerCase() === 'data element'
        && bedesRow.bedesTerm && bedesRow.bedesTerm.toLowerCase() === 'bedes term') {
            return true;
        }
        else {
            return false;
        }
    }

    private isSectionHeader(appRow: AppRow, bedesRow: BedesRow): boolean {
        if (
            (
                (appRow.appTermCode && appRow.appTermCode.match(/^B\.?\d+\./i) && !appRow.dataElement)
                ||
                (appRow.dataElement && appRow.dataElement.match(/^B\.?\d*\./i) && !appRow.appTermCode)
            ) && bedesRow.isEmpty()
        ) {
            return true;
        }
        else {
            return false;
        }
    }

}
