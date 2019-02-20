import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IAppTermList } from '@bedes-common/models/app-term';
import { IAppTerm } from '@bedes-common/models/app-term/app-term.interface';
import { IBedesTerm } from '@bedes-common/models/bedes-term';
import { IBedesConstrainedList } from '../../../../../bedes-common/models/bedes-term/bedes-constrained-list.interface';
import { BedesDataType } from '@bedes-common/enums/bedes-data-type';
const logger = createLogger(module);

/**
 * Handler for saving new BEDES Terms
 * @param request The Express Request object.
 * @param response The Express Response object.
 */
export async function newBedesTermHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug('insert a new Bedes Term...');
        logger.debug(util.inspect(request.body));
        const newItem: IBedesTerm | IBedesConstrainedList = request.body;
        if (!newItem) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        let results: IBedesTerm | IBedesConstrainedList;
        if (newItem._dataTypeId === BedesDataType.ConstrainedList) {
            results = await bedesQuery.terms.newConstrainedList(<IBedesConstrainedList>newItem);
        }
        else {
            results = await bedesQuery.terms.newRecord(<IBedesTerm>newItem);
        }
        logger.debug('insertAppTermHandler resuts');
        console.log(results);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in insertAppTermHandler');
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
