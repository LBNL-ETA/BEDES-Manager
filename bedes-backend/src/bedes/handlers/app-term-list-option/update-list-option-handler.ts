import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option.interface';
const logger = createLogger(module);

/**
 * Route handler for bedes term list option PUT requests. Updates list options for bedes terms.
 */
export async function updateListOptionHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('updateListOptionHandler...');
        logger.debug(util.inspect(request.body));
        const listOption: IBedesTermOption = request.body;
        if (!listOption) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`create a new list option`);
        logger.debug(util.inspect(listOption));
        let results = await bedesQuery.termListOption.updateRecord(listOption);
        logger.debug('compositeTermHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
    }
    catch (error) {
        logger.error('Error in updateListOptionHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
