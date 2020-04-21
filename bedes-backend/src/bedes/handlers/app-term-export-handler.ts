import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { bedesQuery } from '../query';
import { BedesError } from '../../../../bedes-common/bedes-error/bedes-error';
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { IAppTermList } from '@bedes-common/models/app-term';
import { IBedesDataType } from '@bedes-common/models/bedes-data-type';
import { IBedesUnit } from '@bedes-common/models/bedes-unit';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
const logger = createLogger(module);

/**
 * NOTE
 * Application Term Name and Description (App & BEDES) can have newlines in them.
 *
 */

function isITermMappingAtomic(toBeDetermined: any): toBeDetermined is ITermMappingAtomic {
    return '_bedesTermUUID' in toBeDetermined;
}

/**
 * Checks if string contains any special characters
 * @param str string to test
 * @returns bool true if it does
 */
function containsSpecialCharacters(str: string) {
    var regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
    return regex.test(str);
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
            throw new BedesError('Unauthorized', HttpStatusCodes.Unauthorized_401);
        }

        // Make sure the id was passed in
        const appId = request.params.id;
        if (!appId) {
            throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
        }

        const delimiter = '\n';

        // CSV header columns
        var csvContent: string = 'data:text/csv;charset=utf-8,';
        csvContent += 'Application Term,Application Term Description,'
                    + 'Application Term Unit,Application Term Data Type,'
                    + 'BEDES Term,BEDES Term Description,'
                    + 'BEDES Term Unit,BEDES Term Data Type,'
                    + 'BEDES Atomic Term Mapping,BEDES Constrained List Mapping,'
                    + 'BEDES Composite Term UUID,BEDES Atomic Term UUID,'
                    + 'BEDES Constrained List Option UUID'
                    + '\n';

        // Get array of terms in Application
        const results = await bedesQuery.appTerm.getAppTermsByAppId(appId);

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
            let bedesAtomicTermMapping: string = '';
            let bedesConstrainedListMapping: string = '';
            let bedesCompositeTermUUID: string = '';
            let bedesAtomicTermUUID: string = '';
            let bedesConstrainedListOptionUUID: string = '';

            // Temp variables
            let bedesTerm: any = {};

            if (results[i]._name.includes('\n') || containsSpecialCharacters(results[i]._name)) {
                appTermName = "\"" + results[i]._name + "\"";
            } else {
                appTermName = results[i]._name;
            }
            if (results[i]._description) {
                if (results[i]._description!.includes('\n') || results[i]._description!.includes(',')) {
                    appTermDescription = "\"" + results[i]._description! + "\"";
                } else {
                    appTermDescription = results[i]._description!
                }
            }
            appTermUnit = results[i]._unit || '';

            appTermDataType = '';
            if (results[i]._dataTypeId) {
                appTermDataType = (await bedesQuery.dataType.getRecordById(results[i]._dataTypeId!))._name;
            }

            if (results[i]._termTypeId == TermType.ConstrainedList) {
                // Sort list options by their ID
                (<IAppTermList>results[i])._listOptions!.sort((a,b) => (a._id! > b._id!) ? 1 : -1);

                (<IAppTermList>results[i])._listOptions!.forEach((listOption) => {
                    bedesConstrainedListMapping += listOption._name + ' = ';
                    bedesConstrainedListMapping += listOption._mapping!._bedesOptionName + delimiter;
                    bedesConstrainedListOptionUUID += listOption._mapping!._bedesTermOptionUUID + delimiter;
                });
                bedesConstrainedListMapping = "\"" + bedesConstrainedListMapping;
                bedesConstrainedListMapping += "\"";

                bedesConstrainedListOptionUUID = "\"" + bedesConstrainedListOptionUUID;
                bedesConstrainedListOptionUUID += "\"";
                bedesConstrainedListOptionUUID = bedesConstrainedListOptionUUID.replace('/\n$/', '');
            }

            if (results[i]._mapping) {
                bedesTermName = results[i]._mapping!._bedesName;

                if (isITermMappingAtomic(results[i]._mapping)) {    // Atomic Term
                    // For atomic terms, atomic term UUID and composite term UUID are same
                    bedesAtomicTermUUID = (results[i]._mapping as any)._bedesTermUUID;
                    bedesCompositeTermUUID = bedesAtomicTermUUID;

                    bedesTerm = await bedesQuery.terms.getRecordByUUID((results[i]._mapping as any)._bedesTermUUID);
                    if (bedesTerm._description) {
                        if (bedesTerm._description!.includes('\n') || bedesTerm._description!.includes(',')) {
                            bedesTermDescription = "\"" + bedesTerm._description! + "\"";
                        } else {
                            bedesTermDescription = bedesTerm._description!
                        }
                    }
                    if (bedesTerm._unitId) {
                        let bedesUnit: IBedesUnit = await bedesQuery.units.getRecordById(bedesTerm._unitId);
                        bedesTermUnit = bedesUnit._name;
                        if (bedesTermUnit == 'n/a') {
                            bedesTermUnit = '';
                        }
                    }
                    let bedesDataType: IBedesDataType = await bedesQuery.dataType.getRecordById(bedesTerm._dataTypeId);
                    bedesTermDataType = bedesDataType._name;

                    bedesAtomicTermMapping += bedesTermName + ' = [value]';
                } else {                                            // Composite Term
                    bedesCompositeTermUUID = (results[i]._mapping as any)._compositeTermUUID;

                    bedesTerm = await bedesQuery.compositeTerm.getRecordCompleteByUUID(bedesCompositeTermUUID);
                    if (bedesTerm._description) {
                        if (bedesTerm._description!.includes('\n') || bedesTerm._description!.includes(',')) {
                            bedesTermDescription = "\"" + bedesTerm._description! + "\"";
                        } else {
                            bedesTermDescription = bedesTerm._description!
                        }
                    }
                    if (bedesTerm._unitId) {
                        let bedesUnit: IBedesUnit = await bedesQuery.units.getRecordById(bedesTerm._unitId);
                        bedesTermUnit = bedesUnit._name;
                        if (bedesTermUnit == 'n/a') {
                            bedesTermUnit = '';
                        }
                    }
                    bedesTermDataType = '';
                    if (bedesTerm._dataTypeId) {
                        bedesTermDataType = (await bedesQuery.dataType.getRecordById(bedesTerm._dataTypeId))._name;
                    }

                    // Sort the items for correct BEDES Atomic Term Mapping & BEDES Atomic Term UUIDs.
                    bedesTerm._items.sort((a: any, b: any) => (a._orderNumber > b._orderNumber) ? 1 : -1);

                    for (let j = 0; j < bedesTerm._items.length; j += 1) {
                        bedesAtomicTermMapping += bedesTerm._items[j]._term._name;

                        if (bedesTerm._items[j]._listOption) {
                            bedesAtomicTermMapping += ' = ' + bedesTerm._items[j]._listOption._name + delimiter;
                            bedesAtomicTermUUID += bedesTerm._items[j]._listOption._uuid + delimiter;
                        } else {
                            bedesAtomicTermMapping += ' = [value]';
                            bedesAtomicTermUUID += bedesTerm._items[j]._term._uuid;
                        }
                    }
                    bedesAtomicTermUUID = "\"" + bedesAtomicTermUUID;
                    bedesAtomicTermUUID += "\"";

                    bedesAtomicTermMapping = "\"" + bedesAtomicTermMapping;
                    bedesAtomicTermMapping += "\"";
                }
            }

            let rowContent: string = appTermName + "," + appTermDescription + ","
                    + appTermUnit + "," + appTermDataType + ","
                    + bedesTermName + "," + bedesTermDescription + ","
                    + bedesTermUnit + "," + bedesTermDataType + ","
                    + bedesAtomicTermMapping + ","
                    + bedesConstrainedListMapping + ","
                    + bedesCompositeTermUUID + "," + bedesAtomicTermUUID + ","
                    + bedesConstrainedListOptionUUID
                    + "\n";
            csvContent += rowContent;
        }

        // get the current user that's logged in
        const currentUser = getAuthenticatedUser(request);
        var jsonData = {
            'appName': (await bedesQuery.app.getRecordById(currentUser, appId))._name,
            'data': csvContent
        }

        return response.json(jsonData);
    }
    catch (error) {
        logger.error('Error downloading appTerms');
        logger.error(util.inspect(error));

        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        } else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
