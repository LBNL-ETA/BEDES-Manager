import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../query';
import { IBedesTerm, IBedesConstrainedList } from '@bedes-common/models/bedes-term';
const logger = createLogger(module);

/**
 * Retrieves an array of  IBedesTerm or IBedesConstrainedList object given
 * an array of ids (numeric or uuid).
 */
export async function getBedesTermsMultipleHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug(util.inspect(request.body));
        const termIds = request.body.termIds;
        // check to make sure termIds is present and an Array
        if (!termIds || !Array.isArray(termIds)) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        // array of promises to resolve before returning.
        const promises = new Array<Promise<IBedesTerm | IBedesConstrainedList>>();
        // loop through each termId,
        // call the appropriate query (id or uuid) to retrieve the object.
        termIds.forEach((termId: number | string) => {
            // make sure an id is there
            if (!termId) {
                throw new BedesError(
                    'Missing a valid termId in getBedesTermsMultipleHandler',
                    HttpStatusCodes.BadRequest_400,
                    'Invalid term ids requested'
                )
            }
            // retrieve the record by either numeric id, or uuid
            if (typeof termId === 'number' || (typeof termId === 'string' && termId.match(/^\d+$/))) {
                // id - a number or a string that looks like a number
                promises.push(bedesQuery.terms.getTermOrListById(+termId));
            }
            else {
                // uuid
                promises.push(bedesQuery.terms.getTermOrListByUUID(termId));
            }
        });
        const results = await Promise.all(promises);
        console.log(results);
        response.json(results);
        return;
    }
    catch (error) {
        logger.error('Error in getBedesTermsMultipleHandler');
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
