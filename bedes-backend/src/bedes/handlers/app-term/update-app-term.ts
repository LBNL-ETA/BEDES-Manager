import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IAppTermList } from '@bedes-common/models/app-term';
import { IAppTerm } from '@bedes-common/models/app-term/app-term.interface';
const logger = createLogger(module);

/**
 * Handler for updating existing AppTerm records.
 */
export async function updateAppTermHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('update AppTerm...');
        const appId = request.params.appId;
        const appTermId = request.params.appTermId;
        if (!appId || !appTermId) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        const newItem: IAppTerm | IAppTermList = request.body;
        if (!newItem) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        console.log(newItem);
        let results = await bedesQuery.appTerm.updateAppTerm(newItem);
        logger.debug('updateAppTermHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
    }
    catch (error) {
        logger.error('Error in updateAppTermHandler');
        logger.error(util.inspect(error));
        if (error && error.code === "23505") {
            response.status(HttpStatusCodes.BadRequest_400).send('Term already exists.');
        }
        else if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}