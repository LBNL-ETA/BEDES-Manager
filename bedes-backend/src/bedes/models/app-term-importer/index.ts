import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import * as parser from 'papaparse';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { IAppTermCsvRow, isValidAppTermCsvRow, getTermTypeFromCsvName, getUnitIdFromName, 
        termhasNoMapping, mappedToBedesAtomicTerm, mappedToBedesCompositeTerm, createNewCompositeTerm,
        ICsvBedesAtomicTermMapping, ICsvBedesCompositeTermMapping } from './app-term-csv-row.interface';
import { createLogger } from '@bedes-backend/logging';
import { IAppTerm } from "@bedes-common/models/app-term";
import { IAppTermList } from '@bedes-common/models/app-term/app-term-list.interface';
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { ITermMappingListOption } from '@bedes-common/models/term-mapping/term-mapping-list-option.interface';
import { IAppTermListOption } from '@bedes-common/models/app-term';
import { ITermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite.interface';
import { BedesError } from '@bedes-common/bedes-error';
import { error } from 'winston';

const logger = createLogger(module);

/**
 * TODO
 * 1. Create functions for populating IAppTerm, IAppTermList...
 * 2. Check if description can contain newlines.
 * 3. Check what is the use of BEDES Term Data Type.
 * 4. Talk to Mike and figure out what IAppTermAdditionalInfo is used for.
 * 5. [Imp] Determine Application Term's type and set it accordingly on GUI.
 * 6. Later: Delete entire application even if multiple terms exists in it._
 *
 * NOTE
 * 1. _termCategoryId not needed for import/export.
 */

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
    /** Current User */
    private request: Request;

    /**
     * Build the object.
     * @param fileName 
     */
    constructor(
        filePath: string,
        request: Request,
        fileName: string
    ) {
        // set the upload file path
        this.filePath = filePath;
        // Express Request object
        this.request = request;
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
            throw new BedesError(`The file ${this.fileName} doesn't exist`, 400);
        }

        // read the file into a string
        const fileContents: string = await this.getFileContents();
        // parse the string csv
        const parseResults: parser.ParseResult = this.parseFileContents(fileContents);

        return this.processParseResults(parseResults);
    }

    // /**
    //  * Sets database transaction context for the set of queries
    //  * @returns transaction context 
    //  */
    // private async setTransactionContext(): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         db.tx('app-term-importer', (transaction: any) => {
    //             this.dbCtx = transaction;
    //             resolve();
    //         });
    //     });
    // }

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
     * Parse the file content string of csv file, and return the
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

    /**
     * Parses the papaparse result object
     * @param parseResults papaparse result object
     * @returns array of AppTerm | AppTermList
     */
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
            throw error;
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
        try {
            // Mappings of the headers in csv to the names used in code.
            let csvCodeMapping = {
                'Application Term': 'ApplicationTerm',
                'Application Term Description': 'ApplicationTermDescription',
                'Application Term Unit': 'ApplicationTermUnit',
                'Application Term Data Type': 'AppTermTermDataType',
                'BEDES Term': 'BedesTerm',
                'BEDES Term Description': 'BedesTermDescription',
                'BEDES Term Unit': 'BedesTermUnit',
                'BEDES Term Data Type': 'BedesTermDataType',
                'BEDES Atomic Term Mapping': 'BedesAtomicTermMapping',
                'BEDES Constrained List Mapping': 'BedesConstrainedListMapping',
                'BEDES Composite Term UUID': 'BedesCompositeTermUUID',
                'BEDES Atomic Term UUID': 'BedesAtomicTermUUID',
                'BEDES Constrained List Option UUID': 'BedesConstrainedListOptionUUID'
            }
            let result: any = {};
            for (const fieldName of fieldNames) {
                const newName = fieldName.trim();
                if (!(newName in csvCodeMapping)) {
                    throw error
                }
                // assign the new column name
                result[(csvCodeMapping as any)[newName]] = csvData[fieldName];
            }
            return <IAppTermCsvRow>result;
        } catch (error) {
            logger.error('Invalid csv header.');
            throw new BedesError('Invalid csv header.', 400);
        }
    }

    /**
     * Builds an AppTerm or AppTermList object from a parsed line from csv file.
     * @param parsedCsvTerm The Array element from the parser.ParseResult.data
     * @param fields sanitized column name in csv file
     * @returns Array of AppTerm | AppTermList objects
     */
    private async processCsvTerm(parsedCsvTerm: IAppTermCsvRow, fields: Array<string>): Promise<AppTerm | AppTermList> {
        try {
            // Check if row is valid
            if (!isValidAppTermCsvRow(parsedCsvTerm)) {
                logger.error(`Invalid parsed csv row encountered: Term=(${parsedCsvTerm})`);
                throw new BedesError(`Invalid parsed csv row encountered: Term=(${parsedCsvTerm.ApplicationTerm})`, 400);
            }

            // Get TermType ID and Unit ID
            let appTermTypeId: number = getTermTypeFromCsvName(parsedCsvTerm);
            let appTermUnitId: number | undefined = parsedCsvTerm.ApplicationTermUnit
                                                    ? await getUnitIdFromName(parsedCsvTerm.ApplicationTermUnit)
                                                    : undefined
                                                    ;

            // Application Term has no mapping
            if (termhasNoMapping(parsedCsvTerm)) {
                logger.info(parsedCsvTerm.ApplicationTerm + ` is not mapped to any BEDES Term.`);
                let appTermParams: IAppTerm = {
                    _name: parsedCsvTerm.ApplicationTerm,
                    _termTypeId: appTermTypeId,
                    _description: parsedCsvTerm.ApplicationTermDescription,
                    _unitId: appTermUnitId
                }
                return new AppTerm(appTermParams);
            }

            // Application Term has mapping
            else {
                let resultBedesAtomicTermMap: ICsvBedesAtomicTermMapping = await mappedToBedesAtomicTerm(parsedCsvTerm);

                // Mapped to BEDES Atomic Term
                if (resultBedesAtomicTermMap.MappedToBedesAtomicTerm) {

                    // Mapped to BEDES Atomic Term with no constrained list
                    if (appTermTypeId == TermType.Atomic) {
                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Atomic Term with no constrained list.`);

                        // Create AppTerm object
                        let termMappingAtomicParams: ITermMappingAtomic = {
                            _bedesTermType: TermType.Atomic,
                            _bedesTermUUID: resultBedesAtomicTermMap.BedesTermUUID, 
                            _bedesName: parsedCsvTerm.BedesTerm!
                        }
                        let appTermParams: IAppTerm = {
                            _name: parsedCsvTerm.ApplicationTerm,
                            _termTypeId: appTermTypeId,
                            _description: parsedCsvTerm.ApplicationTermDescription,
                            _unitId: appTermUnitId,
                            _mapping: termMappingAtomicParams
                        }
                        return new AppTerm(appTermParams);
                    }

                    // Mapped to BEDES Atomic Term with constrained list
                    else {
                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Atomic Term with constrained list.`);

                        // Create array of constrained list mappings for AppTermList object
                        const results = new Array<IAppTermListOption>();
                        for (let i = 0; i < resultBedesAtomicTermMap.BedesConstrainedListID!.length; i += 1) {
                            if (resultBedesAtomicTermMap.BedesConstrainedListUUID![i] && resultBedesAtomicTermMap.BedesConstrainedListID![i]) {
                                let termMappingListOptionParams: ITermMappingListOption = {
                                    _id: resultBedesAtomicTermMap.BedesConstrainedListID![i],
                                    _bedesTermOptionUUID: resultBedesAtomicTermMap.BedesConstrainedListUUID![i],
                                    _bedesOptionName: resultBedesAtomicTermMap.BedesConstrainedListMapping![i].split('=')[1].trim()
                                }
                                let appTermListOptionParams: IAppTermListOption = {
                                    _name: resultBedesAtomicTermMap.BedesConstrainedListMapping![i].split('=')[0].trim(),
                                    _mapping: termMappingListOptionParams
                                }
                                results.push(appTermListOptionParams);
                            } else {
                                let appTermListOptionParams: IAppTermListOption = {
                                    _name: resultBedesAtomicTermMap.BedesConstrainedListMapping![i].split('=')[0].trim()
                                }
                                results.push(appTermListOptionParams);
                            }
                        }
                        // Create AppTermList object
                        let termMappingAtomicParams: ITermMappingAtomic = {
                            _bedesTermType: TermType.ConstrainedList,
                            _bedesTermUUID: resultBedesAtomicTermMap.BedesTermUUID,
                            _bedesName: parsedCsvTerm.BedesTerm!
                        }
                        let appTermListParams: IAppTermList = {
                            _name: parsedCsvTerm.ApplicationTerm,
                            _termTypeId: appTermTypeId,
                            _description: parsedCsvTerm.ApplicationTermDescription,
                            _unitId: appTermUnitId,
                            _listOptions: results,
                            _mapping: termMappingAtomicParams
                        }
                        return new AppTermList(appTermListParams);
                    }
                }

                else {
                    // Check if term is mapped to BEDES Composite Term
                    let resultBedesCompositeTermMap: ICsvBedesCompositeTermMapping = await mappedToBedesCompositeTerm(parsedCsvTerm, this.request);

                    // Create new composite term
                    if (!resultBedesCompositeTermMap.BedesCompositeTermUUID) {
                        let savedTerm = await createNewCompositeTerm(parsedCsvTerm, resultBedesCompositeTermMap, this.request);
                        resultBedesCompositeTermMap.BedesCompositeTermUUID = savedTerm.BedesCompositeTermUUID;                    
                    }

                    // Mapped to BEDES Composite Term with no constrained list
                    if (appTermTypeId == TermType.Atomic) {
                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Composite Term and has no constrained list.`);
                        let termMappingCompositeParams: ITermMappingComposite = {
                            _bedesName: parsedCsvTerm.BedesTerm!,
                            _compositeTermUUID: resultBedesCompositeTermMap.BedesCompositeTermUUID,
                            _ownerName: 'null',                         // TODO: PG: Change this.
                            _scopeId: 1,
                        }
                        let appTermParams: IAppTerm = {
                            _name: parsedCsvTerm.ApplicationTerm,
                            _termTypeId: appTermTypeId,
                            _description: parsedCsvTerm.ApplicationTermDescription,
                            _unitId: appTermUnitId,
                            _mapping: termMappingCompositeParams
                        }
                        return new AppTerm(appTermParams);
                    }

                    // Mapped to BEDES Composite Term with constrained list
                    else {
                        // Create array of constrained list mappings for AppTermList object
                        const results = new Array<IAppTermListOption>();
                        for (let i = 0; i < resultBedesCompositeTermMap.BedesConstrainedListID!.length; i += 1) {

                            if (resultBedesCompositeTermMap.BedesCompositeTermUUID![i] && resultBedesCompositeTermMap.BedesConstrainedListID![i]) {
                                let termMappingListOptionParams: ITermMappingListOption = {
                                    _id: resultBedesCompositeTermMap.BedesConstrainedListID![i],
                                    _bedesTermOptionUUID: resultBedesCompositeTermMap.BedesConstrainedListUUID![i],
                                    _bedesOptionName: resultBedesCompositeTermMap.BedesConstrainedListMapping![i].split('=')[1].trim()
                                }
                                let appTermListOptionParams: IAppTermListOption = {
                                    _name: resultBedesCompositeTermMap.BedesConstrainedListMapping![i].split('=')[0].trim(),
                                    _mapping: termMappingListOptionParams
                                }
                                results.push(appTermListOptionParams);
                            } else {
                                let appTermListOptionParams: IAppTermListOption = {
                                    _name: resultBedesCompositeTermMap.BedesConstrainedListMapping![i].split('=')[0].trim()
                                }
                                results.push(appTermListOptionParams);
                            }
                        }

                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Composite Term and has a constrained list.`);
                        let termMappingCompositeParams: ITermMappingComposite = {
                            _bedesName: parsedCsvTerm.BedesTerm!,
                            _compositeTermUUID: resultBedesCompositeTermMap.BedesCompositeTermUUID,
                            _ownerName: 'null',                         // TODO: PG: Change this.
                            _scopeId: 1,
                        }
                        let appTermListParams: IAppTermList = {
                            _name: parsedCsvTerm.ApplicationTerm,
                            _termTypeId: appTermTypeId,
                            _description: parsedCsvTerm.ApplicationTermDescription,
                            _unitId: appTermUnitId,
                            _listOptions: results,
                            _mapping: termMappingCompositeParams
                        }
                        return new AppTermList(appTermListParams);
                    }
                }
            }
        } catch (error) {
            logger.error(`error in processCsvTerm: Term=(${parsedCsvTerm.ApplicationTerm})`);
            if (error instanceof BedesError) {
                throw error;
            } else {
                throw new BedesError(error.message + `Term=(${parsedCsvTerm.ApplicationTerm})`, HttpStatusCodes.BadRequest_400);
            }
        }
    }
}
