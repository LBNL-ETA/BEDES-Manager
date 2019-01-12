import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Handler for retrieving specific AppTerm objects.
 */
export async function getAppTermHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('get app term');
        const appTermId = Number(request.params.id);
        if (!appTermId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        let results = await bedesQuery.appTerm.getAppTermById(appTermId);
        logger.debug('getAppTerm resuts');
        logger.debug(util.inspect(results));
        response.json(results)
        return results;
    }
    catch (error) {
        logger.error('Error in getAppTerm');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
