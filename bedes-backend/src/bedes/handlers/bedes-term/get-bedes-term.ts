import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Retrieves a IBedesTerm or IBedesConstrainedList object by a given id.
 * @param request 
 * @param response 
 * @returns bedes term handler 
 */
export async function getBedesTermHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug(util.inspect(request.params));
        const termId = request.params.id;
        if (!termId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        // retrieve the record by either numeric id, or uuid
        if (termId.match(/^\d+$/)) {
            // id
            let results = await bedesQuery.terms.getTermOrListById(termId);
            console.log(termId);
            console.log(results);
            response.json(results)
        }
        else {
            // uuid
            let results = await bedesQuery.terms.getTermOrListByUUID(termId);
            response.json(results)
        }
    }
    catch (error) {
        logger.error('Error in getBedesTermHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode)
                .send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
