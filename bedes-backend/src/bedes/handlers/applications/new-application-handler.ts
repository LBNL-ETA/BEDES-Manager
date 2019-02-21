import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
const logger = createLogger(module);

/**
 * Route handler for MappingApplication POST requests.
 * Creates a new MappingApplication record.
 */
export async function newMappingApplicationHandler(request: Request, response: Response): Promise<any> {
    try {
        if (!request.isAuthenticated()) {
            logger.warn('User not authenticated');
            response.status(HttpStatusCodes.Unauthorized_401).send('Unauthorized');
            return;
        }
        const user = <CurrentUser>request.user;
        if (!user) {
            logger.error('User serialization error in newVerificationCodeHandler, unable to cast user to CurrentUser');
            throw new Error('User serialization error in newVerificationCodeHandler, unable to cast user to CurrentUser')
        }
        const newItem: IMappingApplication= request.body;
        if (!newItem) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        let results = await bedesQuery.app.newRecord(user, newItem);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in newMappingApplicationHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}
