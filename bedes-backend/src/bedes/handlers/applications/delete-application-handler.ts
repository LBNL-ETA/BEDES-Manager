import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
const logger = createLogger(module);

/**
 * Route handler for MappingApplication DELETE requests.
 * Deletes a MappingApplication record.
 */
export async function deleteMappingApplicationHandler(request: Request, response: Response): Promise<any> {
    try {
        if (!request.params.id) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        const id = +request.params.id;
        let results = await bedesQuery.app.deleteRecord(id);
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
