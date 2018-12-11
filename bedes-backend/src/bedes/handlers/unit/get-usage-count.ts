import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IUsageCount } from '@bedes-common/interfaces/usage-count.interface';
const logger = createLogger(module);

export async function getUnitUsageCount(request: Request, response: Response): Promise<any> {
    try {
        console.log('getUnitUsageCount');
        const unitId = request.params.unitId;
        if (!unitId) {
            logger.error('missing unitId');
            response.status(HttpStatusCodes.BadRequest_400).send('Invalid parameters.');
            return;
        }
        let results: IUsageCount = await bedesQuery.units.getUsageCount(unitId);
        logger.debug('received usage count');
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


