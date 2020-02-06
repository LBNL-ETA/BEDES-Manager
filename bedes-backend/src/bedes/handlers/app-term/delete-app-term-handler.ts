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

        try {
            let results = await bedesQuery.appTerm.deleteAppTermById(id);
            response.json(results)
        } catch (error) {
            // foreign key violation. Delete app term list options first, then delete app term.
            if (error.code == "23503") {
                let temp1 = await bedesQuery.mappedTerm.deleteMappingsByAppTerm(id);
                let temp2 = await bedesQuery.appTermListOption.deleteByTermTypeId(id);
                let results = await bedesQuery.appTerm.deleteAppTermById(id);
                response.json(results)
            } else {
                throw error;
            }
        }
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
