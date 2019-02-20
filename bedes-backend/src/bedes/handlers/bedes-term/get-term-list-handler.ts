
import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Retrieves the complete list of BEDES Terms
 */
export async function getTermListHandler(request: Request, response: Response): Promise<any> {
    try {
        console.log('get all terms...');
        let results = await bedesQuery.terms.getAllTerms()
        console.log(results);
        response.json(results)
}
    catch (error) {
        logger.error('Error in getBedesTermHandler');
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
