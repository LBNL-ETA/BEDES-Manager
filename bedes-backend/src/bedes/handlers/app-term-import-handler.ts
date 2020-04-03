import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { AppTermImporter } from '../models/app-term-importer/index';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { UPLOAD_PATH } from '../uploads/index';
import { bedesQuery } from '../query';
import { BedesError } from '../../../../bedes-common/bedes-error/bedes-error';
import { db } from '@bedes-backend/db';
const logger = createLogger(module);

/**
 * TODO
 * 1. Change filename from app-term-import-handler to something like 'term-importer.ts'
 * 2. Do the same as above for app-term-export-handler as well.
 */

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

        // Make sure the id was passed in
        const appId = request.params.id;
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

        let importer = new AppTermImporter(UPLOAD_PATH, request, request.file.filename);
        const appTerms = await importer.run();
        // const results = await bedesQuery.appTerm.newAppTerms(appId, appTerms.map(item => item.toInterface()));

        // Push appTerms to database
        db.tx('saveTerms', async (trans: any) => {
            const promises = new Array<Promise<any>>();
            for (let appTerm of appTerms) {
                const data = appTerm.toInterface();
                promises.push(bedesQuery.appTerm.newAppTerm(appId, data, trans));
            }

            const results = await Promise.all(promises)
            .catch((error: any) => {
                if (error instanceof BedesError) {
                    response.status((<BedesError>error).responseStatusCode).send(error.message);
                } else {
                    response.status(HttpStatusCodes.BadRequest_400).send(error.message);
                }
            });
            response.json(results);
        });
    }
    catch (error) {
        logger.error('Error importing appTerms');
        logger.error(util.inspect(error));
        if (error && error.code === "23505") {
            response.status(HttpStatusCodes.BadRequest_400).send('Term already exists.');
        }
        else if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.BadRequest_400).send('Unknown error: ' + error.responseMessage);
        }
    }
}
