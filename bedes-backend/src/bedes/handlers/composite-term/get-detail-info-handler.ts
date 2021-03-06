import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
const logger = createLogger(module);

/**
 * Route handler retrieving ICompositeTermDetail records from ICompositeTermDetailRequestParam objects.
 */
export async function getCompositeTermDetailInfoHandler(request: Request, response: Response): Promise<any> {
    try {
        logger.debug(util.inspect(request.body));
        const queryParams = request.body.queryParams;
        if (!queryParams || !Array.isArray(queryParams)) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        logger.debug(`get composite term details query`);
        console.log(queryParams);
        let results = await bedesQuery.compositeTerm.getCompositeTermDetailInfo(queryParams);
        logger.debug('compositeTermHandler resuts');
        logger.debug(util.inspect(results));
        response.json(results)
    }
    catch (error) {
        logger.error('Error in compositeTermHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}



