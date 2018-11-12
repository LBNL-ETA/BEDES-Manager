import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../query';
const logger = createLogger(module);

/**
 * Returns the list of Bedes Term Categories.
 * @param request 
 * @param response 
 * @returns bedes term category list 
 */
export async function getBedesTermCategoryList(request: Request, response: Response): Promise<any> {
    try {
        let results = await bedesQuery.termCategory.getAllRecords();
        logger.debug('received termCategory list');
        logger.debug(`type: ${typeof results}`)
        logger.debug(util.inspect(results));
        response.json(results);
    }
    catch (error) {
        logger.error('Error in getBedesTermCategoryList');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode)
                .send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
