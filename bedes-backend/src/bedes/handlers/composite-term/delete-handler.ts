import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';

/**
 * Route handler for CompositeTerm DELETE requests.
 * Deletes a CompositeTerm record.
 */
export async function deleteCompositeTermHandler(request: Request, response: Response): Promise<any> {
    try {
        // uuid should be a url parameter
        const uuid = request.params.id;
        if (!uuid) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        // delete the record
        // wait for the query to finish
        let results = await bedesQuery.compositeTerm.deleteRecord(uuid);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in deleteMappingApplicationHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
