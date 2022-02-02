import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import {CurrentUser} from '@bedes-common/models/current-user';
import {getAuthenticatedUser} from '@bedes-backend/util/get-authenticated-user';
const logger = createLogger(module);

/**
 * Handler for retrieving Array<AppTerm|AppTermList> for a given mapping application.
 */
export async function getAllAppTermsHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('get all app terms');
        let currentUser: CurrentUser | undefined;
        try {
            currentUser = getAuthenticatedUser(request)
        } catch (error) {
            // Unauthenticated requests are still valid.
        }
        let includePublic = false;
        if (request.query.includePublic) {
            includePublic = !!+request.query.includePublic;
        }
        let results = await bedesQuery.appTerm.getAppTerms(currentUser, includePublic);
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
