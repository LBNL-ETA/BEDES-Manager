import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { db } from '@bedes-backend/db';
import { BedesCompositeTerm } from '../../../../../bedes-common/models/bedes-composite-term/bedes-composite-term';
const logger = createLogger(module);

/**
 * Route handler for CompositeTerm DELETE requests.
 * Deletes a CompositeTermDetail record.
 */
export async function deleteCompositeTermDetailHandler(request: Request, response: Response): Promise<any> {
    try {
        // id should be a url parameter
        const id = request.params.id;
        if (!id) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        return db.tx('trans', async (transaction: any) => {
            console.log('new transaction')
            let results = await bedesQuery.compositeTermDetail.deleteCompositeTermDetailById(id, transaction);
            console.log('term detail deleted')
            console.log(results);
            let newTermData = await bedesQuery.compositeTerm.getRecordComplete(id);
            console.log(newTermData);
            const newTerm = new BedesCompositeTerm(newTermData);
            newTerm.refresh();
            let saveResults = await bedesQuery.compositeTerm.updateCompositeTerm(newTerm.toInterface());
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
