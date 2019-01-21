import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Route handler for application get requests.
 * Retrieves the list of available applications.
 */
export async function getApplicationsHandler(request: Request, response: Response): Promise<any> {
    try {
        let results = await bedesQuery.app.getAllRecords();
        response.json(results)
    }
    catch (error) {
        logger.error('Error in getApplicationsHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}


