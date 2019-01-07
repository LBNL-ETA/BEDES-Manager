import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
const logger = createLogger(module);

/**
 * Route handler for MappingApplication POST requests.
 * Creates a new MappingApplication record.
 */
export async function newMappingApplicationHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('newMappingApplication...');
        logger.debug(util.inspect(request.body));
        const newItem: IMappingApplication= request.body;
        if (!newItem) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`create a new mapping application`);
        logger.debug(util.inspect(newItem));
        let results = await bedesQuery.app.newRecord(newItem);
        logger.debug('newMappingApplicationHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
    }
    catch (error) {
        logger.error('Error in newListOptionHandler');
        logger.error(util.inspect(error));
        if (error && error.code === "23505") {
                response.status(HttpStatusCodes.BadRequest_400).send('Application already exists.');
        }
        else if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
