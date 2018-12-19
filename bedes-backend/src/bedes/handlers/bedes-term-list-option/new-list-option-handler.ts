import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { INewBedesTermOption } from '@bedes-common/models/new-list-option/new-list-option.interface';
const logger = createLogger(module);

/**
 * Route handler for bedes term list option POST requests. Creates list options for bedes terms.
 */
export async function newListOptionHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('newListOptionHandler...');
        logger.debug(util.inspect(request.body));
        const newListOption: INewBedesTermOption = request.body;
        if (!newListOption) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`create a new list option`);
        logger.debug(util.inspect(newListOption));
        let results = await bedesQuery.termListOption.newRecord(newListOption.termId, newListOption.termOption);
        logger.debug('compositeTermHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
    }
    catch (error) {
        logger.error('Error in newListOptionHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
