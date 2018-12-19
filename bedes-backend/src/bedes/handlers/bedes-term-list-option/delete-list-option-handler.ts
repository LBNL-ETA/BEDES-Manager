import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { INewBedesTermOption } from '@bedes-common/models/new-list-option/new-list-option.interface';
const logger = createLogger(module);

/**
 * Route handler for bedes term list option DELETE requests. Deletes list options for bedes terms.
 */
export async function deleteListOptionHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('deleteListOptionHandler...');
        logger.debug(util.inspect(request.params));
        const termOptionId = Number(request.params.id);
        if (!termOptionId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`delete list option ${termOptionId}`);
        let results = await bedesQuery.termListOption.deleteRecord(termOptionId);
        logger.debug('delete option results');
        logger.debug(util.inspect(results));
        // return a 204
        response.sendStatus(HttpStatusCodes.NoContent_204);
    }
    catch (error) {
        logger.error('Error in deleteListOptionHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
