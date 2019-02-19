import path from 'path';
import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { AppTermImporter } from '../models/app-term-importer/index';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { UPLOAD_PATH } from '../uploads/index';
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
        const testPath = path.join(__dirname, '../models/app-term-importer/test-files');
        const testFile = 'app-term-import-test.csv';
        let importer = new AppTermImporter(testPath, testFile);
        // let importer = new AppTermImporter(UPLOAD_PATH, request.file.filename);
        const appTerms = await importer.run();
        logger.debug('done');
        console.log(appTerms);
        response.json(appTerms);
    }
    catch (error) {
        logger.error('Error uploading template');
        logger.error(util.inspect(error));
        response.status(HttpStatusCodes.ServerError_500);
    }
}
