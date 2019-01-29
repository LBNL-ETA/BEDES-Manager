import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Route handler for AppTerm DELETE requests.
 * Deletes a MappingApplication record.
 */
export async function deleteAppTermHandler(request: Request, response: Response): Promise<any> {
    try {
        const id = request.params.appTermId;
        logger.debug(`deleteAppTermHandler (${id})`);
        if (!id) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        let results = await bedesQuery.appTerm.deleteAppTermById(id);
        logger.debug('success');
        console.log(results);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in deleteAppTermHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
