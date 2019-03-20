import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IBedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short/bedes-composite-term-short.interface';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
import { CurrentUser } from '@bedes-common/models/current-user';
const logger = createLogger(module);

/**
 * Route handler retrieving all composite terms in the database.
 */
export async function compositeTermGetAllHandler(
    request: Request,
    response: Response
): Promise<any> {
    try {
        let currentUser: CurrentUser | undefined;
        // try to get an authenticated user
        // unauthenticted requests are valid so igore errors
        try {
            currentUser = getAuthenticatedUser(request)
        } catch (error) {
        }
        let results = await bedesQuery.compositeTerm.getAllTerms(currentUser);
        logger.debug('compositeTermHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
    }
    catch (error) {
        logger.error('Error in compositeTermHandler');
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



