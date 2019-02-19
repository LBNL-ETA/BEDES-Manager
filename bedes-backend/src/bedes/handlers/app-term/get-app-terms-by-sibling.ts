import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { isUUID } from '../../../../../bedes-common/util/is-uuid';
const logger = createLogger(module);

/**
 * Handler for loading the complete set of AppTerms for a given application,
 * given an id for one of the AppTerms.
 */
export async function getAppTermsSiblingHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('get app terms from sibling');
        const id = request.params.id;
        // make sure the id was passed in
        if (!id) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                'Invalid parameters'
            )
        }
        if (isUUID(id)) {
            console.log(`get AppTerm siblings by uuid (${id})`);
            let results = await bedesQuery.appTerm.getAppTermBySiblingUUID(id);
            logger.debug('getAppTerms uuid resuts');
            logger.debug(util.inspect(results));
            response.json(results)
        }
        else {
            const appTermId = Number(id);
            if (!appTermId) {
                throw new BedesError(
                    'Invalid parameters',
                    HttpStatusCodes.BadRequest_400,
                    "Invalid parameters"
                );
            }
            let results = await bedesQuery.appTerm.getAppTermBySibling(appTermId);
            logger.debug('getAppTerms resuts');
            logger.debug(util.inspect(results));
            response.json(results)
        }
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
