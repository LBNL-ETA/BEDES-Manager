import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { CurrentUser } from '../../../../../bedes-common/models/current-user/current-user';
const logger = createLogger(module);

/**
 * Route handler for MappingApplication PUT requests.
 * Updates a MappingApplication record.
 */
export async function updateMappingApplicationHandler(request: Request, response: Response): Promise<any> {
    try {
        if (!request.isAuthenticated()) {
            logger.warn('User not authenticated');
            response.status(HttpStatusCodes.Unauthorized_401).send('Unauthorized');
            return;
        }
        const user = <CurrentUser>request.user;
        if (!user) {
            logger.error('User serialization error in updateMappingApplicationHandler, unable to cast user to CurrentUser');
            throw new Error('User serialization error in updateMappingApplicationHandler, unable to cast user to CurrentUser')
        }
        const item: IMappingApplication= request.body;
        if (!item) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                "Invalid parameters"
            );
        }
        let results = await bedesQuery.app.updateRecord(user, item);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in updateMappingApplicationHandler');
        logger.error(util.inspect(error));
        if (error && error.code === "23505") {
                response.status(HttpStatusCodes.BadRequest_400).send('Application name already exists.');
        }
        else if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}

