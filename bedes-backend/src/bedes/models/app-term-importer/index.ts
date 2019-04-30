import path from 'path';
import fs from 'fs';
import * as parser from 'papaparse';
import { UPLOAD_PATH } from '../../uploads';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { IAppTermCsvRow, isValidAppTermCsvRow, getTermTypeFromCsvName, getUnitIdFromName } from './app-term-csv-row.interface';
import { createLogger } from '@bedes-backend/logging';
import { IAppTerm } from '@bedes-common/models/app-term/app-term.interface';
import { IAppTermList } from '@bedes-common/models/app-term/app-term-list.interface';
import { IAppTermListOption } from '@bedes-common/models/app-term';
import { db } from '@bedes-backend/db';
const logger = createLogger(module);

/**
 * Parses an uploaded application term definition file, and builds
 * a set of objects that can be imported and loaded into the
 * BEDES Manager database.
 */
export class AppTermImporter {
    /** The absoluate file path to the file upload folder. */
    private filePath: string;
    /** The absolute path to the uploaded file */
    private absoluteFilePath: string;
    /** The uploaded file to import */
    private fileName: string
    /** The database transaction context */
    private dbCtx: any;

    /**
     * Build the object.
     * @param fileName 
     */
    constructor(
        filePath: string,
        fileName: string
    ) {
        // set the upload file path
        this.filePath = filePath;
        // set the upload file
        this.fileName = fileName;
        // Set the abosolute path
        this.absoluteFilePath = path.join(this.filePath, this.fileName);
    }

    /**
     * Runs the importer.
     */
    public async run(): Promise<Array<AppTerm | AppTermList>> {
        // make sure the file exists
        if (!this.fileExists()) {
            logger.error(`file ${this.absoluteFilePath} doesn't exist`)
            throw new Error(`The file ${this.fileName} doesn't exist`);
        }
        // read the file into a string
        const fileContents: string = await this.getFileContents();
        // parse the string csv
        const parseResults: parser.ParseResult = this.parseFileContents(fileContents);
        // set queries to run as a transaction
        await this.setTransactionContext();
        // use the results to build the AppTerms
        return this.processParseResults(parseResults);

        // console.log('file contents:');
        // console.log(fileContents);
        // console.log('parseReslts');
        // console.log(parseResults);
        // run the parser
    }

    /**
     * Sets database transaction context for the set of queries
     * @returns transaction context 
     */
    private async setTransactionContext(): Promise<any> {
        return new Promise((resolve, reject) => {
            db.tx('app-term-importer', (transaction: any) => {
                this.dbCtx = transaction;
                resolve();
            });
        });
    }

    /**
     * Returns the file contents as a string.
     */
    private getFileContents(): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.absoluteFilePath, 'utf8', (err, contents) => {
                if (err) {
                    reject('Unable to open file');
                }
                resolve(contents);
            });
        });
    }

    /**
     * Parse the file content string csf file, and return the
     * papaparse result object.
     * @param fileContents 
     * @returns file contents 
     */
    private parseFileContents(fileContents: string): parser.ParseResult {
        return parser.parse(fileContents, {
            delimiter: ',',
            header: true
        });
    }

    /**
     * Determines if the file indicated actually exists.
     * @returns true if the file is there, false if not.
     */
    private fileExists(): boolean {
        return fs.existsSync(this.absoluteFilePath);
    }

    private async processParseResults(parseResults: parser.ParseResult): Promise<Array<AppTerm | AppTermList>> {
        try {
            const promises = new Array<Promise<AppTerm | AppTermList>>();
            const headerFields = this.transformHeaderFieldNames(parseResults.meta.fields);
            for (const csvData of parseResults.data) {
                if (Object.keys(csvData).length === 1 && !csvData['Term Name']) {
                    continue;
                }
                const appTermCsv = this.makeIAppTermCsvRow(csvData, parseResults.meta.fields);
                promises.push(this.processCsvTerm(appTermCsv, headerFields));
            }
            return await Promise.all(promises);
        }
        catch (error) {
            logger.error('Error in processParseResults');
            console.log(error);
            throw error
        }
    }

    /**
     * Transforms the header field names, which contain spaces, into strings
     * without spaces.
     * @param headerFieldNames 
     * @returns header field names 
     */
    private transformHeaderFieldNames(headerFieldNames: Array<string>): Array<string> {
        const results = new Array<string>();
        for (const headerField of headerFieldNames) {
            results.push(headerField.replace(/ /g, ''))
        }
        // add the extra columns for the list options
        results.push('__parsed_extra');
        return results;
    }

    /**
     * Transforms the object returned from papaparse into an IAppTermCsvRow object.
     * @param csvData 
     * @param existingFieldNames 
     * @param newFieldNames 
     * @returns iappterm csv row 
     */
    private makeIAppTermCsvRow(csvData: any, fieldNames: Array<string>): IAppTermCsvRow {
        let result: any = {};
        for (const fieldName of fieldNames) {
            // make the new name
            const newName = fieldName.replace(/ /g, '');
            // assign the new column name
            result[newName] = csvData[fieldName];
        }
        if (csvData['__parsed_extra']) {
            result['__parsed_extra'] = csvData['__parsed_extra'];
        }
        return <IAppTermCsvRow>result;
    }

    /**
     * Builds an AppTerm or AppTermList object from a parsed line from the csv file.
     * @param csvTerm The Array element from the parser.ParseResult.data
     * @param fields 
     * @returns Array of AppTerm | AppTermList objects
     */
    private async processCsvTerm(parsedCsvTerm: IAppTermCsvRow, fields: Array<string>): Promise<AppTerm | AppTermList> {
        // make sure required fields are there
        if (!isValidAppTermCsvRow(parsedCsvTerm)) {
            logger.error(`Invalid parsed csv row encountered: (${parsedCsvTerm})`);
            console.log(parsedCsvTerm);
            throw new Error(`Invalid parsed csv row encountered: (${parsedCsvTerm})`);
        }
        const termName = parsedCsvTerm.TermName.trim();
        const termType = getTermTypeFromCsvName(parsedCsvTerm.TermType);
        const unitId: number | undefined = parsedCsvTerm.Unit
            ? await getUnitIdFromName(parsedCsvTerm.Unit)
            : undefined
        ;
        if (!termName || !termType) {
            throw new BedesError(
                'Invalid parameters.',
                HttpStatusCodes.BadRequest_400,
                'Invalid parameters.'
            )
        }
        if (termType === TermType.Atomic) {
            // build the AppTerm params
            let params: IAppTerm = {
                _name: parsedCsvTerm.TermName,
                _termTypeId: termType,
                _description: parsedCsvTerm.Description,
                _unitId: unitId

            }
            // return the AppTerm object
            return new AppTerm(params);
        }
        else if (termType === TermType.ConstrainedList) {
            const listOptions = new Array<string>();
            // build the AppTermList params
            let params: IAppTermList = {
                _name: parsedCsvTerm.TermName,
                _termTypeId: termType,
                _description: parsedCsvTerm.Description,
                _unitId: unitId,
                _listOptions: this.extractListOptions(parsedCsvTerm)
            }
            // return the AppTermList object.
            return new AppTermList(params);
        }
        else {
            throw new Error(`Invalid term type encountered (${termType})`);
        }

    }

    /**
     * Takes the parsedCsvTerm and extracts the list option name/description
     * strings, and returns them as a single array.
     */
    private extractListOptions(parsedCsvTerm: IAppTermCsvRow): Array<IAppTermListOption> {
        //Holds the resulting array
        const results = new Array<IAppTermListOption>();
        // add the first name/description pair
        if (typeof parsedCsvTerm.ListOptionName === 'string' && parsedCsvTerm.ListOptionName.trim()) {
            results.push(<IAppTermListOption>{
                _name: parsedCsvTerm.TermName.trim(),
                _description: parsedCsvTerm.Description
            });
        }
        // process the rest of the list options
        if (Array.isArray(parsedCsvTerm.__parsed_extra)) {
            let hasName = false;
            let listOption: IAppTermListOption | undefined;
            for (const item of parsedCsvTerm.__parsed_extra) {
                if (!hasName) {
                    // create the listOption object
                    listOption = <IAppTermListOption>{
                        _name: item
                    }
                    // add the list option object to the result array
                    results.push(listOption);
                    hasName = true;
                }
                else {
                    // listOption
                    if (!listOption) {
                        throw new Error('Unknonw Error');
                    }
                    // assign the list option
                    listOption._description = item;
                    hasName = false;
                }
            }
        }
        return results;
    }

    /**
     * Valids list option
     * @param name 
     * @returns true if list option 
     */
    private validListOption(name: string | null | undefined): boolean {
        if (typeof name === 'string' && name.trim()) {
            return true;
        }
        else {
            return false;
        }
    }

}