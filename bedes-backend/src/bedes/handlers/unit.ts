import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../query';
const logger = createLogger(module);

export async function getBedesUnitList(request: Request, response: Response): Promise<any> {
    try {
        console.log('getBedesUnitList');
        let results = await bedesQuery.units.getAllRecords();
        logger.debug('received unit list');
        logger.debug(`type: ${typeof results}`)
        // logger.debug(util.inspect(results));
        response.json(results);
    }
    catch (error) {
        logger.error('Error in getBedesUnitList');
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

