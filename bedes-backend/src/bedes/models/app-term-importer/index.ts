import * as fs from 'fs';
import { v4 } from 'uuid';
import * as parser from 'papaparse';
import { bedesQuery } from '@bedes-backend/bedes/query/index';
import { IBedesTerm } from "@bedes-common/models/bedes-term/bedes-term.interface"; 
import { IBedesConstrainedList } from "@bedes-common/models/bedes-term/bedes-constrained-list.interface"; 
import { IBedesTermOption } from "@bedes-common/models/bedes-term-option/bedes-term-option.interface"; 
import { IBedesTermCategory } from "@bedes-common/models/bedes-term-category/bedes-term-category.interface";
import { IBedesDataType } from "@bedes-common/models/bedes-data-type/bedes-data-type.interface";
import { IBedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit.template';
import { IBedesTermSectorLink } from '@bedes-common/models/bedes-term-sector-link/bedes-term-sector-link.interface';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';
import { IBedesSector } from '@bedes-common/models/bedes-sector/bedes-sector.interface';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';

/**
 * Parses an uploaded application term definition file, and builds
 * a set of objects that can be imported and loaded into the
 * BEDES Manager database.
 * 
 * STEPS
 * 1. Delete all existing data from tables (check psql_db_operations.txt)
 * 2. Reset the identity columns of all the tables in the database (check psql_db_operations.txt)
 * 3. Import the two BEDES Terms and BEDES Constrained List Options csv files.
 * 4. Go to app-term-import-handler.ts and modify the files array.
 * 5. Run this script.
 * 6. Upload db dump to AWS.
 */
export class AppTermImporter {
    
    private filePath: string;
    private fileNames: Array<string>;
    private bedesFileContents: string = '';
    private bedesConstrainedListFileContents: string = '';
    private bedesListOptionArray: Array<any> = [];

    private listOfStates: Array<string> = [ 
        'AA',
        'AE',
        'AK',
        'AL',
        'AP',
        'AR',
        'AS',
        'AZ',
        'CA',
        'CO',
        'CT',
        'DC',
        'DE',
        'FL',
        'FM',
        'GA',
        'GU',
        'HI',
        'IA',
        'ID',
        'IL',
        'IN',
        'KS',
        'KY',
        'LA',
        'MA',
        'MD',
        'ME',
        'MH',
        'MI',
        'MN',
        'MO',
        'MP',
        'MS',
        'MT',
        'NC',
        'ND',
        'NE',
        'NH',
        'NJ',
        'NM',
        'NV',
        'NY',
        'OH',
        'OK',
        'OR',
        'PA',
        'PR',
        'PW',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VA',
        'VI',
        'VT',
        'WA',
        'WI',
        'WV',
        'WY',
    ];

    constructor(filePath: string, fileNames: Array<string>) {
        this.filePath = filePath;
        this.fileNames = fileNames;
    }

    /**
     * Runs the importer.
     */
    public async run(): Promise<Array<BedesTerm | BedesConstrainedList>> {
        
        this.bedesFileContents = await this.getFileContents(this.filePath + '/' + this.fileNames[0]);
        this.bedesConstrainedListFileContents = await this.getFileContents(this.filePath + '/' + this.fileNames[1]);

        // parse the string csv
        const bedesFileContentsparseDResults: parser.ParseResult = this.parseFileContents(this.bedesFileContents);
        const bedesConstrainedListFileContentsParsedResults: parser.ParseResult = this.parseFileContents(this.bedesConstrainedListFileContents);

        this.bedesListOptionArray = this.processParseResults1(bedesConstrainedListFileContentsParsedResults);
        return this.processParseResults2(bedesFileContentsparseDResults);
    }

    /**
     * Returns the file contents as a string.
     */
    private getFileContents(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, contents) => {
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
            header: true,
            newline: '\n'
        });
    }

    private processParseResults1(parseResults: parser.ParseResult): Array<any> {
        
        var result: Array<any> = [];
        try {
            const headerFields = this.transformHeaderFieldNames(parseResults.meta.fields);

            for (const csvData of parseResults.data) {
                const bedesTermCsvRow = this.getRow1(csvData, parseResults.meta.fields);
                result.push(bedesTermCsvRow);
            }
            return result;
        }
        catch (error) {
            throw new Error('error processing bedes list options csv: ' + error);
        }
    }    

    private async processParseResults2(parseResults: parser.ParseResult): Promise<Array<BedesTerm | BedesConstrainedList>> {
        try {
            const promises = new Array<Promise<BedesTerm | BedesConstrainedList>>();
            const headerFields = this.transformHeaderFieldNames(parseResults.meta.fields);

            for (const csvData of parseResults.data) {
                const bedesTermCsvRow = this.getRow2(csvData, parseResults.meta.fields);                
                promises.push(this.processCsvTerm(bedesTermCsvRow, headerFields));
            }
            return await Promise.all(promises);
        }
        catch (error) {
            throw new Error('error processing bedes terms csv: ' + error);
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
     * Transforms the object returned from papaparse into an IBedesTermOption object.
     * @param csvData 
     * @param existingFieldNames 
     * @param newFieldNames 
     * @returns IBedesTerm csv row 
     */
    private getRow1(csvData: any, fieldNames: Array<string>): any {

        let result: any = {}
        let headerMapping = {
            '"Content-UUID"': '_uuid',
            'URL': '_url',
            'List-Option': '_name',
            'List-Option-Definition': '_description',
            'Unit-of-Measure': '_unit',
            'Related-Term': '_relatedTerm',
            'Related-Term-UUID': '_relatedTermUUID',
            'Sector': '_sector',
            'Updated-Date': '_updatedDate'
        }

        for (const fieldName of fieldNames) {
            const newName = fieldName.trim();
            result[(headerMapping as any)[newName]] = csvData[fieldName];
        }

        return result;
    }
    
    /**
     * Transforms the object returned from papaparse into an IBedesTerm object.
     * @param csvData 
     * @param existingFieldNames 
     * @param newFieldNames 
     * @returns IBedesTerm csv row 
     */
    private getRow2(csvData: any, fieldNames: Array<string>): any {

        let result: any = {}
        let headerMapping = {
            '"Content-UUID"': '_uuid',
            'URL': '_url',
            'Term': '_name',
            'Definition': '_description',
            'Data-Type': '_dataType',
            'Unit-of-Measure': '_unit',
            'Category': '_category',
            'Sector': '_sector',
            'Updated-Date': '_updatedDate'
        }

        for (const fieldName of fieldNames) {
            const newName = fieldName.trim();
            result[(headerMapping as any)[newName]] = csvData[fieldName];
        }

        return result;
    }

    private isValidRow(parsedCsvTerm: any): boolean {
       
        if (parsedCsvTerm['_uuid'] 
            && parsedCsvTerm['_url'] 
            && parsedCsvTerm['_name']
            && parsedCsvTerm['_description']
            && parsedCsvTerm['_dataType']
            // && parsedCsvTerm['_updatedDate']
            // && parsedCsvTerm['_sector']
            // && parsedCsvTerm['_unit']
            && parsedCsvTerm['_category']) {
                return true;
            }
        else {
            return false;
        }
    }

    /**
     * Retrieves the unit id from the given unit name.
     *
     * @param unitName The name of the unit name to query the database.
     * @returns A Promise which resolves to the id of the found unit.
     */
    private async getUnitIdFromName(unitName: string): Promise<number | null | undefined> {
        
        if (typeof unitName !== 'string' || !unitName.trim()) {
            unitName = 'n/a';
        }

        let unit: IBedesUnit | undefined;
        try {
            unit = await bedesQuery.units.getRecordByName(unitName.trim());
            return unit._id;
        } catch (error) {
            throw new Error('error getting unit id from name: ' + error);
        }
    }

    /**
     * Retrieves the term category id from the given term category name.
     *
     * @param unitName The name of the term category name to query the database.
     * @returns A Promise which resolves to the id of the found term category.
     */
    private async getTermCategoryIdFromName(termCategoryName: string): Promise<number | null | undefined> {

        if (typeof termCategoryName !== 'string' || !termCategoryName.trim()) {
            throw new BedesError(
                'Term Category ${termCategoryName} not found.',
                HttpStatusCodes.BadRequest_400
            )
        }
        
        let termCategory: IBedesTermCategory | undefined;
        try {
            termCategory = await bedesQuery.termCategory.getRecordByName(termCategoryName.trim());
            return termCategory._id;
        } catch (error) {
            throw new BedesError(
                `Term Category ${termCategoryName} doesn't exist.`,
                HttpStatusCodes.BadRequest_400
            );
        }
    }

    /**
     * Retrieves the data type id from the given data type name.
     *
     * @param dataType The name of the data type name to query the database.
     * @returns A Promise which resolves to the id of the found data type.
     */
    private async getDataTypeIdFromName(dataTypeName: string): Promise<number | null | undefined> {
        if (typeof dataTypeName !== 'string' || !dataTypeName.trim()) {
            throw new BedesError(
                'Data type ${dataTypeName} not found.',
                HttpStatusCodes.BadRequest_400
            )
        }
        
        let dataType: IBedesDataType | undefined;
        try {
            dataType = await bedesQuery.dataType.getRecordByName(dataTypeName.trim());
            return dataType._id;
        } catch (error) {
            throw new BedesError(
                `Data Type ${dataTypeName} doesn't exist.`,
                HttpStatusCodes.BadRequest_400
            );
        }
    }

    /**
     * Retrieves the Array<Sector> from the given sector name.
     *
     * @param sectorName The name of the sectors name to query the database.
     * @returns A Promise which resolves to the id of the found sectors.
     */
    private async getSectors(sectorName: string): Promise<Array<IBedesTermSectorLink>> {
        
        if (typeof sectorName !== 'string' || !sectorName.trim()) {
            let result: Array<IBedesTermSectorLink> = [];
            let temp: IBedesTermSectorLink = {
                _sectorId: 1 // id=1 => name='n/a'
            }
            result.push(temp)
            return result;
        }
        
        let sectors: Array<IBedesSector> | undefined;
        try {
            sectors = await bedesQuery.sector.getAllRecords();

            let result: Array<IBedesTermSectorLink> = [];
            let arraySector = sectorName.split(',');
            for (const secName of arraySector) {
                var trimmedSecName: string = secName.trim();
                for (const sectorResult of sectors) {
                    if (trimmedSecName == sectorResult._name) {
                        let temp: IBedesTermSectorLink = {
                            _sectorId: sectorResult._id!
                        }
                        result.push(temp);
                    }
                }
            }
            return result;
        } catch (error) {
            throw new BedesError(
                `Sector ${sectorName} doesn't exist.`,
                HttpStatusCodes.BadRequest_400
            );
        }
    }

    /**
     * Add “Other, Unknown, None, Not applicable” to every BEDES Constrained List.
     * @returns Array<IBedesTermOption> of the 4 constrained list options
     */
    private getListOfRequisiteConstrainedListOptions(unitId: number) {
        var listOptions: Array<string> = ['Other', 'Unknown', 'None', 'Not applicable']
        var result: Array<IBedesTermOption> = [];

        for (let i = 0; i < listOptions.length; i += 1) {
            let params: IBedesTermOption = {
                _name: listOptions[i],
                _description: '',
                _unitId: unitId,
                _uuid: v4()
            }
            result.push(params)
        }

        return result;
    }

    /**
     * Builds a BedesTerm or BedesTermList object from a parsed line from the csv file.
     * @param csvTerm The Array element from the parser.ParseResult.data
     * @param fields 
     * @returns Array of BedesTerm | BedesTermList objects
     */
    private async processCsvTerm(parsedCsvTerm: any, fields: Array<string>): Promise<BedesTerm | BedesConstrainedList> {

        if (!this.isValidRow(parsedCsvTerm)) {
            throw new Error('invalid row encountered');
        }

        // In Version 2.3 csv file, all terms have unitId and termCategoryId
        let unitId: number | null | undefined = await this.getUnitIdFromName(parsedCsvTerm['_unit']);
        if (unitId == null) {
            throw new Error('term has no unitId');
        }

        let termCategoryId: number | null | undefined = await this.getTermCategoryIdFromName(parsedCsvTerm['_category']);
        if (termCategoryId == null) {
            throw new Error('term has no category id');
        }

        let dataTypeId: number | null | undefined = await this.getDataTypeIdFromName(parsedCsvTerm['_dataType']);
        if (dataTypeId == null) {
            throw new Error('term has no data type id');
        }

        let arraySectors: Array<IBedesTermSectorLink> = await this.getSectors(parsedCsvTerm['_sector']);
        if (arraySectors == null) {
            throw new Error('term has no sectors');
        }

        // BEDES Term
        if (parsedCsvTerm['_dataType'] != 'Constrained List') {

            let bedesTermParams: IBedesTerm = {
                // _id?: number | null | undefined;
                _termCategoryId: termCategoryId,
                _name: parsedCsvTerm['_name'],
                _description: parsedCsvTerm['_description'],
                _dataTypeId: dataTypeId,
                _unitId: unitId,
                // _definitionSourceId?: number | null | undefined;
                _uuid: parsedCsvTerm['_uuid'],
                _url: parsedCsvTerm['_url'],
                _sectors: arraySectors
            }

            // export interface IBedesTerm {
            //     _id?: number | null | undefined;
            //     _termCategoryId: number;
            //     _name: string;
            //     _description: string;
            //     _dataTypeId: number;
            //     _unitId?: number | null | undefined;
            //     _definitionSourceId?: number | null | undefined;
            //     _uuid: string | null | undefined;
            //     _url: string | null | undefined;
            //     _sectors: Array<IBedesTermSectorLink>
            // }

            return new BedesTerm(bedesTermParams);
        } 

        // BEDES Term with Constrained List
        else {

            let arrayBedesTermOptions: Array<IBedesTermOption> = []

            for (const x of this.bedesListOptionArray) {
                
                // TODO: Add further checking to ensure that if the names are equal, then UUID have to be similar and vice-versa
                if ((x['_relatedTerm'] == parsedCsvTerm['_name']) 
                    && x['_relatedTermUUID'] == parsedCsvTerm['_uuid']) {
                    
                    let listOptionUnitId: number | null | undefined = await this.getUnitIdFromName(x['_unit']);
                    if (listOptionUnitId == null) {
                        throw new Error('term has no unitId');
                    }

                    let bedesTermOptionParams: IBedesTermOption = {
                        // _id?: number | null | undefined;
                        _name: x['_name'],
                        _description: x['_description'],
                        _unitId: listOptionUnitId,
                        // _definitionSourceId?: number | null | undefined;
                        _url: x['_url'],
                        _uuid: x['_uuid']
                    }
                    arrayBedesTermOptions.push(bedesTermOptionParams);
                }
            }

            if (!arrayBedesTermOptions || !arrayBedesTermOptions.length) {
                
                // // Handle 'Credential State' case
                // if (parsedCsvTerm['_name'] == 'Credential State') {
                    
                //     let listOptionUnitId: number | null | undefined = await this.getUnitIdFromName('n/a');
                //     if (listOptionUnitId == null) {
                //         throw new Error('term has no unitId');
                //     }

                //     for (var state of this.listOfStates) {
                //         let bedesTermOptionParams: IBedesTermOption = {
                //             // _id?: number | null | undefined;
                //             _name: state,
                //             _description: '',
                //             _unitId: listOptionUnitId,
                //             // _definitionSourceId?: number | null | undefined;
                //             _url: '',
                //             _uuid: v4()
                //         }
                //         arrayBedesTermOptions.push(bedesTermOptionParams);
                //     }
                // }

                let mapping = {
                    'Corner Of': 'Cardinal Orientation', // Comments say "Cardinal Direction"
                    'Credential State': 'State',
                    'Street Name Post Directional': 'Cardinal Orientation', // Comment doesn't mention corresponding constrained list
                    'Street Name Pre Directional': 'Cardinal Orientation', // Comments say "Cardinal Direction"
                    'Utility Services': 'Resource',
                    'Attic Access Location': 'Conditioning Status',
                    'Attic Venting': 'Conditioning Status' ,
                    'Exposure': 'Location',
                    'Input Resource Type': 'Resource',
                    'Output Resource Type': 'Resource',
                    'Heat Pump Backup System Fuel': 'Resource', // Comment doesn't mention corresponding constrained list (check email)
                    'Refrigeration Compressor Type': 'Chiller Compressor Type',
                    'Done loading terms': ''
                }

                if (parsedCsvTerm['_name'] in mapping) {

                    for (const x of this.bedesListOptionArray) {
                
                        // TODO: Add further checking to ensure that if the names are equal, then UUID have to be similar and vice-versa
                        if ((x['_relatedTerm'] == (mapping as any)[parsedCsvTerm['_name']])) {
                            
                            let listOptionUnitId: number | null | undefined = await this.getUnitIdFromName(x['_unit']);
                            if (listOptionUnitId == null) {
                                throw new Error('term has no unitId');
                            }
        
                            let bedesTermOptionParams: IBedesTermOption = {
                                // _id?: number | null | undefined;
                                _name: x['_name'],
                                _description: x['_description'],
                                _unitId: listOptionUnitId,
                                // _definitionSourceId?: number | null | undefined;
                                _url: x['_url'],
                                _uuid: v4()
                            }
                            arrayBedesTermOptions.push(bedesTermOptionParams);
                        }
                    }
                }
            }

            let naUnitId: number | null | undefined = await this.getUnitIdFromName('n/a');
            if (naUnitId == null || naUnitId == undefined) {
                throw new Error('n/a does not have a Unit ID');
            }
            var list: Array<IBedesTermOption> = this.getListOfRequisiteConstrainedListOptions(naUnitId);
            arrayBedesTermOptions = arrayBedesTermOptions.concat(list)

            let bedesConstrainedListParams: IBedesConstrainedList = {
                // _id?: number | null | undefined;
                _termCategoryId: termCategoryId,
                _name: parsedCsvTerm['_name'],
                _description: parsedCsvTerm['_description'],
                _dataTypeId: dataTypeId,
                _unitId: unitId,
                // _definitionSourceId?: number | null | undefined;
                _uuid: parsedCsvTerm['_uuid'],
                _url: parsedCsvTerm['_url'],
                _sectors: arraySectors,
                _options: arrayBedesTermOptions
            }

            // Add ids for all the list options
            for (var i = 0; i < bedesConstrainedListParams._options.length; i += 1) {
                bedesConstrainedListParams._options[i]._id = i;
            }

            return new BedesConstrainedList(bedesConstrainedListParams);

            // export interface IBedesTermOption {
            //     _id?: number | null | undefined;
            //     _name: string;
            //     _description: string;
            //     _unitId?: number | null | undefined;
            //     _definitionSourceId?: number | null | undefined;
            //     _url?: string | null | undefined;
            //     _uuid?: string | null | undefined;
            // }
        }
    }
}