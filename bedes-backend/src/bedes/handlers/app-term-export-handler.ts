import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { bedesQuery } from '../query';
import { BedesError } from '../../../../bedes-common/bedes-error/bedes-error';
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { IAppTermList } from '@bedes-common/models/app-term';
import { appTerm } from '.';
const logger = createLogger(module);

/**
 * 
 * TODO
 * 1. Check if app description, app name has newlines in it.
 * 2. Code organization:
 *      1. Create models/app-term-exporter like  models/app-term-import.
 *      2. Rename app-term-export-handler to csv-export-handler
 * 3. Double check columns - Application Unit, BEDES Unit, BEDES Description.
 * 
 * NOTE
 * build-composite-term-signature.ts,
 * `${detailItem.term.id}:${detailItem.listOption.id}`; where detailItem has type CompositeTermDetail.
 */

function isITermMappingAtomic(toBeDetermined: any): toBeDetermined is ITermMappingAtomic {
    return '_bedesTermUUID' in toBeDetermined;
}


/**
 * Handler for processing the AppTerm csv file download.
 * @param request The Express.Request object.
 * @param response 
 * @returns comma separated string
 */
export async function appTermExportHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('appTermExportHandler received request');

        if (!request.isAuthenticated()) {
            console.log("request not authenticated");
            throw new BedesError('Unauthorized', HttpStatusCodes.Unauthorized_401);
        }

        // Make sure the id was passed in
        const appId = request.params.id;
        if (!appId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                'Invalid parameters'
            )
        }

        // Delimiter (change to newline later)
        const delimiter = '   |   ';

        // CSV header columns
        var csvContent: string = 'data:text/csv;charset=utf-8,' + '\n';
        csvContent += 'Application Term,Application Term Description,'
                    + 'Application Term Unit,Application Term Data Type,'
                    + 'BEDES Term,BEDES Term Description,'
                    + 'BEDES Term Unit,BEDES Term Data Type,'
                    + 'BEDES Atomic Term Mapping,BEDES Constrained List Mapping,'
                    + 'BEDES Composite Term UUID,BEDES Atomic Term UUID,'
                    + 'BEDES Constrained List Option UUID' + '\n';

        // Get array of terms in Application
        const results = await bedesQuery.appTerm.getAppTermsByAppId(appId);

        // Get list of BEDES units
        const bedesUnits = await bedesQuery.units.getAllRecords();

        for (let i = 0; i < results.length; i += 1) {

            // Initalize column variables
            let appTermName: string = '';
            let appTermDescription: string = '';
            let appTermUnit: string = '';
            let appTermDataType: string = '';
            let bedesTermName: string = '';
            let bedesTermDescription: string = '';
            let bedesTermUnit: string = '';
            let bedesTermDataType: string = '';
            let bedesAtomicTermMapping: string = '';                // TODO: Join each element with \n
            let bedesConstrainedListMapping: string = '';           // TODO: Join each element with \n
            let bedesCompositeTermUUID: string = '';
            let bedesAtomicTermUUID: string = '';
            let bedesConstrainedListOptionUUID: string = '';        // TODO: Join each element with \n 

            // Temp variables
            let bedesTerm: any = {};
            let bedesTermUnitId: number = -1;


            appTermName = results[i]._name;

            if (results[i]._description) {
                appTermDescription = results[i]._description || '';
            }

            if (results[i]._termTypeId == 1) {                      // Atomic Term
                appTermDataType = 'Atomic';
                bedesTermDataType = 'Atomic';
            } else if (results[i]._termTypeId == 2) {               // Constrained List Term
                appTermDataType = 'Constrained List';
                bedesTermDataType = 'Constrained List';

                if ((<IAppTermList>results[i])._listOptions) {
                    (<IAppTermList>results[i])._listOptions!.forEach((listOption) => {
                        bedesConstrainedListMapping += listOption._name + '=';
                        if (listOption._mapping) {
                            bedesConstrainedListMapping += listOption._mapping._bedesOptionName + delimiter;
                            if (listOption._mapping._bedesTermOptionUUID) {
                                bedesConstrainedListOptionUUID += listOption._mapping._bedesTermOptionUUID + delimiter;
                            }
                        } else {
                            bedesConstrainedListMapping += '' + delimiter;
                        }
                    });
                } else {
                    throw new BedesError(
                        'Constrained List Type has no list options',
                        HttpStatusCodes.ServerError_500
                    )
                }
            } else {
                throw new BedesError(
                    'Term type has to be either Atomic or Constrained List', 
                    HttpStatusCodes.ServerError_500, 
                    'Invalid Term Type'
                )
            }

            if (results[i]._mapping) {

                bedesTermName = results[i]._mapping!._bedesName;

                if (isITermMappingAtomic(results[i]._mapping)) {    // Atomic Term
                    // For atomic terms, atomic term UUID and composite term UUID are same
                    bedesAtomicTermUUID = (results[i]._mapping as any)._bedesTermUUID;
                    bedesCompositeTermUUID = bedesAtomicTermUUID;

                    bedesTerm = await bedesQuery.terms.getRecordByUUID((results[i]._mapping as any)._bedesTermUUID);
                    bedesTermDescription = bedesTerm._description || '';
                    bedesTermUnitId = bedesTerm._unitId || '';

                    bedesAtomicTermMapping += bedesTermName + '=[value]';
                } else {                                            // Composite Term
                    bedesCompositeTermUUID = (results[i]._mapping as any)._compositeTermUUID;
                    bedesTerm = await bedesQuery.compositeTerm.getRecordCompleteByUUID(bedesCompositeTermUUID);
                    bedesTermDescription = bedesTerm._description || '';
                    bedesTermUnitId = bedesTerm._unitId || '';

                    for (let j = 0; j < bedesTerm._items.length; j += 1) {
                        bedesAtomicTermUUID += bedesTerm._items[j]._term._uuid + delimiter;
                        bedesAtomicTermMapping += bedesTerm._items[j]._term._name;
                        if (bedesTerm._items[j]._listOption) {
                            bedesAtomicTermMapping += '=\"' + bedesTerm._items[j]._listOption._name + '\"' + delimiter;
                        } else {
                            bedesAtomicTermMapping += '=[value]' + delimiter;
                        }
                    }
                }
            } else {
                console.log(appTermName, " - No mapping exists!");
            }

            for (let j = 0; j < bedesUnits.length; j += 1) {
                if (results[i]._unitId == bedesUnits[j]._id) {
                    appTermUnit = bedesUnits[j]._name;
                } else if (bedesTermUnitId == bedesUnits[j]._id) {
                    bedesTermUnit = bedesUnits[j]._name;
                }
            }

            let rowContent: string = appTermName + "," + appTermDescription + ","
                    + appTermUnit + "," + appTermDataType + ","
                    + bedesTermName + "," + bedesTermDescription + ","
                    + bedesTermUnit + "," + bedesTermDataType + ","
                    + bedesAtomicTermMapping + "," + bedesConstrainedListMapping + ","
                    + bedesCompositeTermUUID + "," + bedesAtomicTermUUID + ","
                    + bedesConstrainedListOptionUUID + "\n";
            csvContent += rowContent;
        }

        return response.json(csvContent);
    }
    catch (error) {
        logger.error('Error downloading appTerms');
        
        logger.error(util.inspect(error));

        // PG: Check the first if statement. Not needed for export.
        if (error && error.code === "23505") {
            response.status(HttpStatusCodes.BadRequest_400).send('Term already exists.');
        }
        else if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
