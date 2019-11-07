import path from 'path';
import fs from 'fs';
import * as parser from 'papaparse';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { IAppTermCsvRow, isValidAppTermCsvRow, getTermTypeFromCsvName, 
        getUnitIdFromName, termhasNoMapping, termhasMapping, mappedToBedesAtomicTerm,
        mappedToBedesCompositeTerm } from './app-term-csv-row.interface';
import { createLogger } from '@bedes-backend/logging';
import { IAppTerm } from '@bedes-common/models/app-term/app-term.interface';
import { IAppTermList } from '@bedes-common/models/app-term/app-term-list.interface';
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { ITermMappingListOption } from '@bedes-common/models/term-mapping/term-mapping-list-option.interface';
import { IAppTermListOption, AppTermListOption } from '@bedes-common/models/app-term';
import { db } from '@bedes-backend/db';
import { ITermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite.interface';
const logger = createLogger(module);

/**
 * TODO
 * 1. Change IAppTermCsvRow to IImportCsvRow.
 * 2. [Bug] Deleting appTermList on GUI doesn't work.
 *
 * NOTE
 * 1. _termCategoryId not needed for import/export.
 */

/**
 * Parses an uploaded application term definition file, and builds
 * a set of objects that can be imported and loaded into the
 * BEDES Manager database.
 */

var delimiter: string = '\n';

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

        return this.processParseResults(parseResults);
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
            'BEDES Atomic Term Mapping\n(list of {BEDES Atomic Term = Value})': 'BedesAtomicTermMapping',
            'BEDES Constrained List Mapping\n(list of {Application Term Enumeration = BEDES Constrained List Option)': 'BedesConstrainedListMapping',
            'BEDES Composite Term UUID': 'BedesCompositeTermUUID',
            'BEDES Atomic Term UUID\n(list of {BEDES Atomic Term UUID})': 'BedesAtomicTermUUID',
            'BEDES Constrained List Option UUID\n(list of {BEDES Constrained List Option UUID})': 'BedesConstrainedListOptionUUID'
        }
        let result: any = {};

        for (const fieldName of fieldNames) {

            const newName = fieldName.trim();

            // assign the new column name
            result[(csvCodeMapping as any)[newName]] = csvData[fieldName];
        }

        return <IAppTermCsvRow>result;
    }

    /**
     * Returns true if the term is a constrained list.
     * @param BedesConstrainedListOptionUUID
     */
    private isConstrainedList(BedesConstrainedListOptionUUID: string | null | undefined): boolean {
        // PG TODO: Can possibly put another check to see if the UUID matches the correct regex.

        if (BedesConstrainedListOptionUUID) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Builds an AppTerm or AppTermList object from a parsed line from the csv file.
     * @param csvTerm The Array element from the parser.ParseResult.data
     * @param fields 
     * @returns Array of AppTerm | AppTermList objects
     */
    private async processCsvTerm(parsedCsvTerm: IAppTermCsvRow, fields: Array<string>): Promise<AppTerm | AppTermList> {

        // Make sure required fields are there, i.e. appTermName
        if (!isValidAppTermCsvRow(parsedCsvTerm)) {
            logger.error(`Invalid parsed csv row encountered: (${parsedCsvTerm})`);
            throw new Error(`Invalid parsed csv row encountered: (${parsedCsvTerm})`);
        }

        let appTermTypeId: number = getTermTypeFromCsvName(parsedCsvTerm);
        let appTermUnitId: number | undefined = parsedCsvTerm.ApplicationTermUnit
            ? await getUnitIdFromName(parsedCsvTerm.ApplicationTermUnit)
            : undefined
            ;

        // Application Term has no mapping
        if (termhasNoMapping(parsedCsvTerm)) {
            logger.info(parsedCsvTerm.ApplicationTerm + ` has no mapping.`);

            let appTermParams: IAppTerm = {
                _name: parsedCsvTerm.ApplicationTerm,
                _termTypeId: appTermTypeId,
                _description: parsedCsvTerm.ApplicationTermDescription,
                _unitId: appTermUnitId
                // _id?: number | null | undefined;
                // _fieldCode?: string | null | undefined;
                // _name: string;
                // _termTypeId: TermType;
                // _description?: string | null | undefined;
                // _additionalInfo?: Array<IAppTermAdditionalInfo>;
                // _uuid?: string | null | undefined;
                // _unitId?: number | null | undefined;
                // _mapping?: ITermMappingAtomic | ITermMappingComposite | null | undefined;
            }

            return new AppTerm(appTermParams);
        }

        // Application Term has mapping
        else if (termhasMapping(parsedCsvTerm)) {

            // Application Term is mapped to BEDES Atomic Term
            if (mappedToBedesAtomicTerm(parsedCsvTerm)) {

                // Not a constrained list
                if (appTermTypeId == TermType.Atomic) {
                    logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Atomic Term and has no constrained list.`);

                    let termMappingAtomicParams: ITermMappingAtomic = {
                        _bedesTermType: TermType.Atomic,
                        _bedesTermUUID: parsedCsvTerm.BedesAtomicTermUUID!,
                        _bedesName: parsedCsvTerm.BedesTerm!
                        // /** The id of the object record */
                        // _id?: number | null | undefined;
                        // /** The AppTermListOption in the mapping */
                        // _appListOptionUUID?: string | null | undefined;
                        // /** The TermType of the mapped BedesTerm */
                        // _bedesTermType: TermType;
                        // /** The uuid of the mapped BedesTerm */
                        // _bedesTermUUID: string;
                        // /** The uuid of the mapped BedesTermOption */
                        // _bedesListOptionUUID?: string | null | undefined;
                        // /** The name of the mapping */
                        // _bedesName: string;
                    }

                    let appTermParams: IAppTerm = {
                        _name: parsedCsvTerm.ApplicationTerm,
                        _termTypeId: appTermTypeId,
                        _description: parsedCsvTerm.ApplicationTermDescription,
                        _unitId: appTermUnitId,
                        _mapping: termMappingAtomicParams
                        // _id?: number | null | undefined;
                        // _fieldCode?: string | null | undefined;
                        // _name: string;
                        // _termTypeId: TermType;
                        // _description?: string | null | undefined;
                        // _additionalInfo?: Array<IAppTermAdditionalInfo>;
                        // _uuid?: string | null | undefined;
                        // _unitId?: number | null | undefined;
                        // _mapping?: ITermMappingAtomic | ITermMappingComposite | null | undefined;
                    }

                    return new AppTerm(appTermParams);
                }

                // Constrained list
                else {
                    logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Atomic Term and has a constrained list.`);

                    let termMappingAtomicParams: ITermMappingAtomic = {
                        _bedesTermType: TermType.ConstrainedList,
                        _bedesTermUUID: parsedCsvTerm.BedesAtomicTermUUID!,
                        _bedesName: parsedCsvTerm.BedesTerm!
                        // /** The id of the object record */
                        // _id?: number | null | undefined;
                        // /** The AppTermListOption in the mapping */
                        // _appListOptionUUID?: string | null | undefined;
                        // /** The TermType of the mapped BedesTerm */
                        // _bedesTermType: TermType;
                        // /** The uuid of the mapped BedesTerm */
                        // _bedesTermUUID: string;
                        // /** The uuid of the mapped BedesTermOption */
                        // _bedesListOptionUUID?: string | null | undefined;
                        // /** The name of the mapping */
                        // _bedesName: string;
                    }

                    let appTermListParams: IAppTermList = {
                        _name: parsedCsvTerm.ApplicationTerm,
                        _termTypeId: appTermTypeId,
                        _description: parsedCsvTerm.ApplicationTermDescription,
                        _unitId: appTermUnitId,
                        _listOptions: this.extractAppListOptions(parsedCsvTerm),
                        _mapping: termMappingAtomicParams
                        // _id?: number | null | undefined;
                        // _fieldCode?: string | null | undefined;
                        // _name: string;
                        // _termTypeId: TermType;
                        // _description?: string | null | undefined;
                        // _additionalInfo?: Array<IAppTermAdditionalInfo>;
                        // _uuid?: string | null | undefined;
                        // _unitId?: number | null | undefined;
                        // _listOptions?: Array<IAppTermListOption>;
                    }

                    return new AppTermList(appTermListParams);
                }
            }

            else if (mappedToBedesCompositeTerm(parsedCsvTerm)) {

                // Not a constrained list
                if (appTermTypeId == TermType.Atomic) {
                    logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Composite Term and has no constrained list.`);

                    let termMappingCompositeParams: ITermMappingComposite = {
                        _bedesName: parsedCsvTerm.BedesTerm!,
                        _compositeTermUUID: parsedCsvTerm.BedesCompositeTermUUID!,
                        _ownerName: 'null',                         // PG: Change this.
                        _scopeId: 1,                                // PG: "private, public, approved"
                        // _id?: number | null | undefined;
                        // _appListOptionUUID?: string | null | undefined;
                        // _bedesName: string;
                        // _compositeTermUUID: string;
                        // _ownerName: string;
                        // _scopeId: number;
                    }

                    let appTermParams: IAppTerm = {
                        _name: parsedCsvTerm.ApplicationTerm,
                        _termTypeId: appTermTypeId,
                        _description: parsedCsvTerm.ApplicationTermDescription,
                        _unitId: appTermUnitId,
                        _mapping: termMappingCompositeParams
                        // _id?: number | null | undefined;
                        // _fieldCode?: string | null | undefined;
                        // _name: string;
                        // _termTypeId: TermType;
                        // _description?: string | null | undefined;
                        // _additionalInfo?: Array<IAppTermAdditionalInfo>;
                        // _uuid?: string | null | undefined;
                        // _unitId?: number | null | undefined;
                        // _mapping?: ITermMappingAtomic | ITermMappingComposite | null | undefined;
                    }

                    return new AppTerm(appTermParams);
                }

                // Constrained List
                else {
                    logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Composite Term and has a constrained list.`);

                    let termMappingCompositeParams: ITermMappingComposite = {
                        _bedesName: parsedCsvTerm.BedesTerm!,
                        _compositeTermUUID: parsedCsvTerm.BedesCompositeTermUUID!,
                        _ownerName: 'null',                         // PG: Change this.
                        _scopeId: 1,                                // PG: "private, public, approved"
                        // _id?: number | null | undefined;
                        // _appListOptionUUID?: string | null | undefined;
                        // _bedesName: string;
                        // _compositeTermUUID: string;
                        // _ownerName: string;
                        // _scopeId: number;
                    }

                    let appTermListParams: IAppTermList = {
                        _name: parsedCsvTerm.ApplicationTerm,
                        _termTypeId: appTermTypeId,
                        _description: parsedCsvTerm.ApplicationTermDescription,
                        _unitId: appTermUnitId,
                        _listOptions: this.extractAppListOptions(parsedCsvTerm),
                        _mapping: termMappingCompositeParams
                        // _id?: number | null | undefined;
                        // _fieldCode?: string | null | undefined;
                        // _name: string;
                        // _termTypeId: TermType;
                        // _description?: string | null | undefined;
                        // _additionalInfo?: Array<IAppTermAdditionalInfo>;
                        // _uuid?: string | null | undefined;
                        // _unitId?: number | null | undefined;
                        // _listOptions?: Array<IAppTermListOption>;
                    }

                    return new AppTermList(appTermListParams);
                }
            }

            else {
                throw new Error(`Invalid term type encountered`);
            }
        }

        else {
            throw new Error(`Invalid term type encountered`);
        }
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

    /**
     * Takes the parsedCsvTerm and extracts the list option name/description
     * strings, and returns them as a single array.
     */
    private extractAppListOptions(item: IAppTermCsvRow): Array<IAppTermListOption> {

        // Holds the resulting array
        const results = new Array<IAppTermListOption>();

        var arr_mapping = item.BedesConstrainedListMapping!.trim().split(delimiter);
        var arr_uuid = item.BedesConstrainedListOptionUUID!.trim().split(delimiter);

        for (let i = 0; i < arr_uuid.length; i += 1) {
            let termMappingListOptionParams: ITermMappingListOption = {
                _id: null,                                      // PG: Change this.
                _bedesTermOptionUUID: arr_uuid[i].trim(),
                _bedesOptionName: arr_mapping[i].split('=')[1].trim()
                // _id: number | null | undefined;
                // _bedesTermOptionUUID: string | null | undefined;
                // _bedesOptionName: string | null | undefined;
            }

            let appTermListOptionParams: IAppTermListOption = {
                _name: arr_mapping[i].split('=')[0].trim(),
                _mapping: termMappingListOptionParams
                // /** The id of the object's record in the database. */
                // _id?: number | null | undefined;
                // /** The name of the list option. */
                // _name: string;
                // /** The uuid of the AppTermListOption */
                // _uuid?: string | null | undefined;
                // /** The description of the list option. */
                // _description?: string | null | undefined;
                // /** The unit_id of the list option. */
                // _unitId?: number | null | undefined;
                // /** Defines the mapping between the list option and a BedesTermListOption */
                // _mapping?: ITermMappingListOption | null | undefined;
            }

            results.push(appTermListOptionParams);
        }

        return results;
    }
}
