import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { isUUID } from '@bedes-common/util/is-uuid';
const logger = createLogger(module);

/**
 * Route handler retrieving a complete IBedesCompositeTerm object by id.
 */
export async function compositeTermGetCompleteHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug(util.inspect(request.params));
        const uuid: string = request.params.id;
        if (!uuid || !isUUID(uuid)) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`get a composite term`);
        logger.debug(util.inspect(uuid));
        logger.debug(`isUUID = ${isUUID(uuid)}`);
        let results = await bedesQuery.compositeTerm.getRecordCompleteByUUID(uuid);
        logger.debug('compositeTermHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
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


