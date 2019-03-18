import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { db } from '@bedes-backend/db';
import { BedesCompositeTerm } from '../../../../../bedes-common/models/bedes-composite-term/bedes-composite-term';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
const logger = createLogger(module);

/**
 * Route handler for CompositeTerm DELETE requests.
 * Deletes a CompositeTermDetail record.
 */
export async function deleteCompositeTermDetailHandler(request: Request, response: Response): Promise<any> {
    try {
        // get the current user that's logged in
        const currentUser = getAuthenticatedUser(request);
        // id should be a url parameter
        const id = request.params.id;
        if (!id) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400
            );
        }
        return db.tx('trans', async (transaction: any) => {
            let results = await bedesQuery.compositeTermDetail.deleteCompositeTermDetailById(
                id, transaction
            );
            let newTermData = await bedesQuery.compositeTerm.getRecordComplete(id);
            const newTerm = new BedesCompositeTerm(newTermData);
            newTerm.refresh();
            let saveResults = await bedesQuery.compositeTerm.updateCompositeTerm(
                currentUser,
                newTerm.toInterface()
            );
            console.log('new term saved');
            console.log(saveResults);
            response.json(results)
        });
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
