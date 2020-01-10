import path from 'path';
import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { AppTermImporter } from '../models/app-term-importer/index';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { UPLOAD_PATH } from '../uploads/index';
import { IAppTermList } from '@bedes-common/models/app-term/app-term-list.interface';
import { IAppTerm } from '@bedes-common/models/app-term/app-term.interface';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { bedesQuery } from '../query';
import { BedesError } from '../../../../bedes-common/bedes-error/bedes-error';
import { db } from '@bedes-backend/db';
import { IBedesTerm, BedesTerm, IBedesConstrainedList, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { bedesTerm } from '.';
const logger = createLogger(module);

/**
 * Handler for processing the AppTerm csv file uploads.
 * @param request The Express.Request object.
 * @param response 
 * @returns term import handler 
 */
export async function appTermImportHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('appTermImportHandler received request');
        if (!request.isAuthenticated()) {
            throw new BedesError('Unauthorized', HttpStatusCodes.Unauthorized_401);
        }
        const appId = request.params.id;
        // make sure the id was passed in
        if (!appId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                'Invalid parameters'
            )
        }
        // const testPath = path.join(__dirname, '../models/app-term-importer/test-files');
        // const testFile = 'app-term-import-test.csv';
        // let importer = new AppTermImporter(testPath, testFile);
        var upload_path: string = path.join(__dirname, '../uploads/files');
        
        // BEDES_all-terms_Version 2.3.csv, BEDES_all_list_options_Version 2.3.csv
        var files: Array<string> = ['a931d3bbd795befba32300445c4041e8', 'e960b663105a371ca2f4f6b04f87b118'];

        // let importer = new AppTermImporter(UPLOAD_PATH, request.file.filename);
        let importer = new AppTermImporter(upload_path, files);
        const bedesTerms = await importer.run();

        // Add ids to all the terms.
        for (var i = 0; i < bedesTerms.length; i += 1) {
            bedesTerms[i].id = i;
        } 

        db.tx('saveTerms', async (trans: any) => {
            const promises = new Array<Promise<any>>();
            
            for (let bedesTerm of bedesTerms) {
                
                if (bedesTerm instanceof BedesConstrainedList) {
                    const bedesConstListInterface = bedesTerm.toInterface();
                    promises.push(bedesQuery.terms.newConstrainedList(bedesConstListInterface));
                }
                else if (bedesTerm instanceof BedesTerm) {
                    const bedesTermInterface = bedesTerm.toInterface();
                    promises.push(bedesQuery.terms.newRecord(bedesTermInterface));
                } 
                else {
                    throw new Error('error term is neither BedesTerm nor BedesConstrainedList')
                }
            }
            const results = await Promise.all(promises)
            .catch((error: any) => {
                response.status(HttpStatusCodes.BadRequest_400).send('Error creating terms');
                return;
            });
            // response.json(results.map(item => item.appTerm));
            response.json(results);
        })
        
        // // const results = await bedesQuery.appTerm.newAppTerms(appId, appTerms.map(item => item.toInterface()));
        // db.tx('saveTerms', async (trans: any) => {
        //     const promises = new Array<Promise<any>>();
        //     for (let appTerm of appTerms) {
        //         const data = appTerm.toInterface();
        //         promises.push(bedesQuery.appTerm.newAppTerm(appId, data, trans));
        //     }
        //     const results = await Promise.all(promises)
        //     .catch((error: any) => {
        //         response.status(HttpStatusCodes.BadRequest_400).send('Error creating terms');
        //         return;
        //     });
        //     // response.json(results.map(item => item.appTerm));
        //     response.json(results);
        // })
    }
    catch (error) {
        logger.error('Error importing appTerms');
        logger.error(util.inspect(error));
        logger.error(util.inspect(error));
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
