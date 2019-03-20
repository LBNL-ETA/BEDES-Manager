import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
const logger = createLogger(module);

/**
 * Handler for updating existing BEDES composite terms, ie the PUT handler.
 */
export async function compositeTermPutHandler(request: Request, response: Response): Promise<any> {
    try {
        // get the current user that's logged in
        const currentUser = getAuthenticatedUser(request);
        const compositeTerm = request.body;
        if (!compositeTerm) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400
            );
        }
        logger.debug(`save an existing composite term`);
        logger.debug(util.inspect(compositeTerm));
        let savedTerm = await bedesQuery.compositeTerm.updateCompositeTerm(
            currentUser,
            compositeTerm
        );
        if (!savedTerm || !savedTerm._id) {
            throw new Error('Error updating composite term');
        }
        let newTerm = await bedesQuery.compositeTerm.getRecordComplete(savedTerm._id);
        logger.debug('compositeTermHandler resuts');
        logger.debug(util.inspect(newTerm));
        response.json(newTerm)
    }
    catch (error) {
        logger.error('Error in compositeTermHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
