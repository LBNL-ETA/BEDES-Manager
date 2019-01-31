import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IAppTermListOption } from '@bedes-common/models/app-term/app-term-list-option.interface';
const logger = createLogger(module);

/**
 * Route handler for AppTermListOption option POST requests.
 * 
 * Creates list options for AppTerm objects.
 */
export async function newListOptionHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('newListOptionHandler...');
        logger.debug(util.inspect(request.params.appTermId));
        const appTermId = Number(request.params.appTermId);
        const newListOption: IAppTermListOption = request.body;
        if (!appTermId || !newListOption) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`create a new list option`);
        console.log(newListOption);
        let results = await bedesQuery.appTermListOption.newRecord(appTermId, newListOption);
        logger.debug('newListOptionHandler results');
        console.log(results);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in newListOptionHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
