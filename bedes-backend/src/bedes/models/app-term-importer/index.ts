import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import * as parser from 'papaparse';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { IAppTermCsvRow, isValidAppTermCsvRow, getTermTypeFromCsvName, 
        getUnitIdFromName, termhasNoMapping, termhasMapping, mappedToBedesAtomicTerm,
        mappedToBedesCompositeTerm } from './app-term-csv-row.interface';
import { createLogger } from '@bedes-backend/logging';
import { IAppTerm, IAppTermAdditionalInfo } from "@bedes-common/models/app-term";
import { IAppTermList } from '@bedes-common/models/app-term/app-term-list.interface';
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { ITermMappingListOption } from '@bedes-common/models/term-mapping/term-mapping-list-option.interface';
import { IAppTermListOption, AppTermListOption } from '@bedes-common/models/app-term';
import { ITermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite.interface';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { IBedesTerm } from '@bedes-common/models/bedes-term';
import { IBedesCompositeTerm, ICompositeTermDetail, BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term';
import { IBedesTermOption, BedesTermOption } from '@bedes-common/models/bedes-term-option';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
import { BedesError } from '@bedes-common/bedes-error';

import { db } from '@bedes-backend/db';
import { IBedesUnit } from '@bedes-common/models/bedes-unit';
import { TermMappingListOption } from '@bedes-common/models/term-mapping/term-mapping-list-option';
import { bedesTerm } from '@bedes-backend/bedes/handlers';

const logger = createLogger(module);

/**
 * TODO
 * 1. Create Composite Terms only if the csv file has no errors.
 * 2. Check if composite term name exists if no UUID is present. If not, then create a new composite term.
 * 3. [Bug] Deleting appTermList on GUI doesn't work.
 * 4. Create functions for populating IAppTerm, IAppTermList...
 * 5. Check if description can contain newlines.
 * 6. Check what is the use of BEDES Term Data Type.
 * 7. Talk to Mike and figure out what IAppTermAdditionalInfo is used for.
 * 8. [Imp] Determine Application Term's type and set it accordingly on GUI.
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
    /** Current User */
    private currentUser: Request;

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
        this.currentUser = request;
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
     * Builds an AppTerm or AppTermList object from a parsed line from the csv file.
     * @param csvTerm The Array element from the parser.ParseResult.data
     * @param fields 
     * @returns Array of AppTerm | AppTermList objects
     */
    private async processCsvTerm(parsedCsvTerm: IAppTermCsvRow, fields: Array<string>): Promise<AppTerm | AppTermList> {

        try {
            if (!isValidAppTermCsvRow(parsedCsvTerm)) {
                logger.error(`Invalid parsed csv row encountered: Term=(${parsedCsvTerm})`);
                throw new BedesError(`Invalid parsed csv row encountered: Term=(${parsedCsvTerm.ApplicationTerm})`, 400);
            }
    
            let appTermTypeId: number = getTermTypeFromCsvName(parsedCsvTerm);
    
            // TODO: Check if appTermUnitId ever equals undefined
            // Because getUnitIdFromName throws error if there's anything wrong.
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
                }
                return new AppTerm(appTermParams);
            }
    
            // Application Term has mapping
            else if (termhasMapping(parsedCsvTerm)) {
    
                console.log('term has mapping');
    
                if (await mappedToBedesAtomicTerm(parsedCsvTerm)) {
    
                    console.log('mapped to bedes atomic term');
                    
                    // TODO: Convert this into a function
                    var bedesTermUUID: string = '';
                    if (!parsedCsvTerm.BedesAtomicTermUUID) {
                        let result: IBedesTerm = await bedesQuery.terms.getRecordByName(parsedCsvTerm.BedesTerm!);
                        bedesTermUUID = result._uuid!;
                    }
    
                    if (appTermTypeId == TermType.Atomic) {
                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Atomic Term with no constrained list.`);
                        let termMappingAtomicParams: ITermMappingAtomic = {
                            _bedesTermType: TermType.Atomic,
                            _bedesTermUUID: parsedCsvTerm.BedesAtomicTermUUID 
                                            ? parsedCsvTerm.BedesAtomicTermUUID 
                                            : bedesTermUUID,
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
    
                    // App Term is a constrained list
                    else {
    
                        bedesTermUUID = parsedCsvTerm.BedesAtomicTermUUID ? parsedCsvTerm.BedesAtomicTermUUID : bedesTermUUID
    
                        // Holds the resulting array
                        const results = new Array<IAppTermListOption>();
                        var arr_mapping = parsedCsvTerm.BedesConstrainedListMapping!.trim().split(delimiter);
                        var arr_uuid: Array<string> = [];
                        var arr_id: Array<number> = [];
    
                        for (let i = 0; i < arr_mapping.length; i += 1) {
                            let bedesListOption: string = arr_mapping[i].split('=')[1].trim();
                            if (!bedesListOption.toLowerCase().includes('other')) {
                                let temp = await bedesQuery.termListOption.getRecordByName(bedesTermUUID, bedesListOption);
                                console.log('temp: ', temp);
                                arr_uuid.push(temp._uuid!);
                                arr_id.push(temp._id!);
                            }
                        }
    
                        for (let i = 0; i < arr_uuid.length; i += 1) {
                            let termMappingListOptionParams: ITermMappingListOption = {
                                _id: arr_id[i],                                      // TODO: Change this.
                                _bedesTermOptionUUID: arr_uuid[i].trim(),
                                _bedesOptionName: arr_mapping[i].split('=')[1].trim()
                            }
                            let appTermListOptionParams: IAppTermListOption = {
                                _name: arr_mapping[i].split('=')[0].trim(),
                                _mapping: termMappingListOptionParams
                            }
                            results.push(appTermListOptionParams);
                        }
                        console.log('result: ', results);
    
                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Atomic Term with constrained list.`);
                        let termMappingAtomicParams: ITermMappingAtomic = {
                            _bedesTermType: TermType.ConstrainedList,
                            _bedesTermUUID: parsedCsvTerm.BedesAtomicTermUUID 
                                            ? parsedCsvTerm.BedesAtomicTermUUID 
                                            : bedesTermUUID,
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
                        console.log('appTermListParams: ', appTermListParams);
                        console.log('_listOptions: ', appTermListParams._listOptions);
                        return new AppTermList(appTermListParams);
                    }
                }
    
                else if (await mappedToBedesCompositeTerm(parsedCsvTerm)) {
    
                    console.log('mapped to bedes composite term');
                    
                    var result: IBedesCompositeTerm | undefined = undefined;
                    // Create a new composite term
                    if (!parsedCsvTerm.BedesCompositeTermUUID) {

                        try {
                            let temp: ICompositeTermDetail = await bedesQuery.compositeTermDetail.getRecordByName(parsedCsvTerm.BedesTerm!);
                            result = await bedesQuery.compositeTerm.getRecordById(temp._id!);
                        } catch (error) { }
    
                        if (!result) {
                            console.log('creating new composite term');

                            // TODO: Create below chunk of code into its own function.
                            var signature: string = '';
                            var items: Array<ICompositeTermDetail> = [];
                            var bedesTermOption: IBedesTermOption | null = null;
                            var numAtomicTerms: Array<string> = parsedCsvTerm.BedesAtomicTermMapping!.trim().split(delimiter);
        
                            for (let i = 0; i < numAtomicTerms.length; i += 1) {
                                let arr: Array<string> = numAtomicTerms[i].split("=");
                                let bedesTerm: IBedesTerm = await bedesQuery.terms.getRecordByName(arr[0].trim());
                                if (arr[1].trim().replace(/['"]+/g, "") != '[value]'
                                    && !arr[1].trim().replace(/['"]+/g, "").toLowerCase().includes('other')) {
                                    bedesTermOption = await bedesQuery.termListOption.getRecordByName(bedesTerm._uuid!, 
                                        arr[1].trim().replace(/['"]+/g, ""));
                                    signature += bedesTerm._id! + ':' + bedesTermOption._id!;
                                    signature += '-';
                                } else {
                                    bedesTermOption = null;
                                    signature += bedesTerm._id!; // TODO: Change -1 to whatever was initially used.
                                }
        
                                let compositeTermDetailParams: ICompositeTermDetail = {
                                    _term: bedesTerm,
                                    _listOption: bedesTermOption,
                                    _orderNumber: i + 1 // _orderNumber is 1-indexed
                                }
                                items.push(compositeTermDetailParams);
                            }
                            if (signature[signature.length - 1] == '-') { // "signature += '-'" appends a hypen at the end which needs to be removed
                                signature = signature.slice(0, -1);
                            }
                            console.log('signature: ', signature);
        
                            var bedesCompositeTermUnitId: number | undefined = parsedCsvTerm.BedesTermUnit
                                                                                ? await getUnitIdFromName(parsedCsvTerm.BedesTermUnit)
                                                                                : undefined
        
                            var compositeTermParams: IBedesCompositeTerm = {
                                _signature: signature,
                                _name: parsedCsvTerm.BedesTerm,
                                _description: parsedCsvTerm.BedesTermDescription,
                                _unitId: bedesCompositeTermUnitId,
                                _items: items,
                                _scopeId: 1,                               // TODO: PG: "private, public, approved"
                                _ownerName: 'null'                         // TODO: PG: Change this.
                            }
        
                            let compositeTerm = new BedesCompositeTerm(compositeTermParams);
                            compositeTermParams._uuid = compositeTerm.uuid;
        
                            // get the current user that's logged in
                            const currentUser = getAuthenticatedUser(this.currentUser);
        
                            // save the term
                            var savedTerm = await bedesQuery.compositeTerm.newCompositeTerm(currentUser, compositeTermParams);
                            if (!savedTerm || !savedTerm._id) {
                                throw new BedesError(`Error creating new composite term. Term=(${parsedCsvTerm.ApplicationTerm})`, 400);
                            }
                            console.log('savedTerm: ', savedTerm);
                            // // return the new record
                            // let newTerm = await bedesQuery.compositeTerm.getRecordComplete(savedTerm._id);
                        }
                    } else {
                        // TODO: This is wrong.
                        // If composite term is not found, it will throw an error. Catch this error properly instead of the incorrect if statement
                        let temp: IBedesCompositeTerm = await bedesQuery.compositeTerm.getRecordByUUID(parsedCsvTerm.BedesCompositeTermUUID!);
                        if (!temp) {
                            throw new BedesError(`Cannot find composite term in database with that uuid. Term=(${parsedCsvTerm.ApplicationTerm})`, 400);
                        }
                    }
    
                    if (appTermTypeId == TermType.Atomic) {

                        var bedesCompositeTermUUID: string = '';
                        if (!parsedCsvTerm.BedesCompositeTermUUID) {
                            if (result) {
                                bedesCompositeTermUUID = result._uuid!;
                            } else {
                                bedesCompositeTermUUID = savedTerm!._uuid!;
                            }
                        }

                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Composite Term and has no constrained list.`);
                        let termMappingCompositeParams: ITermMappingComposite = {
                            _bedesName: parsedCsvTerm.BedesTerm!,
                            _compositeTermUUID: parsedCsvTerm.BedesCompositeTermUUID 
                                                ? parsedCsvTerm.BedesCompositeTermUUID!
                                                // : savedTerm!._uuid!,
                                                : bedesCompositeTermUUID,
                            _ownerName: 'null',                         // TODO: PG: Change this.
                            _scopeId: 1,                                // TODO: PG: "private, public, approved"
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
    
                    // Constrained List
                    else {
    
                        var numAtomicTerms: Array<string> = parsedCsvTerm.BedesAtomicTermMapping!.trim().split(delimiter);
                        let bedesTerm: IBedesTerm = await bedesQuery.terms.getRecordByName(numAtomicTerms[numAtomicTerms.length-1].split("=")[0].trim());      
                        var bedesTermUUID: string = bedesTerm._uuid!;
                        
                        // Holds the resulting array
                        const results = new Array<IAppTermListOption>();
                        var arr_mapping = parsedCsvTerm.BedesConstrainedListMapping!.trim().split(delimiter);
                        var arr_uuid: Array<string> = [];
                        var arr_id: Array<number> = [];
    
                        for (let i = 0; i < arr_mapping.length; i += 1) {
                            let bedesListOption: string = arr_mapping[i].split('=')[1].trim();
                            if (!bedesListOption.toLowerCase().includes('other')) {
                                let temp = await bedesQuery.termListOption.getRecordByName(bedesTermUUID, bedesListOption);
                                console.log('temp: ', temp);
                                arr_uuid.push(temp._uuid!);
                                arr_id.push(temp._id!);
                            }
                        }
    
                        for (let i = 0; i < arr_uuid.length; i += 1) {
                            let termMappingListOptionParams: ITermMappingListOption = {
                                _id: arr_id[i],                                      // TODO: Change this.
                                _bedesTermOptionUUID: arr_uuid[i].trim(),
                                _bedesOptionName: arr_mapping[i].split('=')[1].trim()
                            }
                            let appTermListOptionParams: IAppTermListOption = {
                                _name: arr_mapping[i].split('=')[0].trim(),
                                _mapping: termMappingListOptionParams
                            }
                            results.push(appTermListOptionParams);
                        }
                        console.log('result: ', results);
                        
                        logger.info(parsedCsvTerm.ApplicationTerm + ` is mapped to a BEDES Composite Term and has a constrained list.`);
                        let termMappingCompositeParams: ITermMappingComposite = {
                            _bedesName: parsedCsvTerm.BedesTerm!,
                            _compositeTermUUID: parsedCsvTerm.BedesCompositeTermUUID 
                                                ? parsedCsvTerm.BedesCompositeTermUUID!
                                                : savedTerm!._uuid!,
                            _ownerName: 'null',                         // TODO: PG: Change this.
                            _scopeId: 1,                                // TODO: PG: "private, public, approved"
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
            throw new BedesError(`Error in mapping term to atomic or composite term. Term=(${parsedCsvTerm.ApplicationTerm})`, 400);
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
