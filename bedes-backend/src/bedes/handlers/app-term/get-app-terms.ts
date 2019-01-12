import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Handler for retrieving Array<AppTerm|AppTermList> for a given mapping application.
 */
export async function getAppTermsHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('get app terms');
        const appId = Number(request.params.id);
        if (!appId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        let results = await bedesQuery.appTerm.getAppTermsByAppId(appId);
        logger.debug('getAppTerms resuts');
        logger.debug(util.inspect(results));
        response.json(results)
        return results;
    }
    catch (error) {
        logger.error('Error in getAppTerms');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
