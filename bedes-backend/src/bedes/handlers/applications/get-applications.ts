import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { bedesQuery } from '../../query';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
const logger = createLogger(module);

/**
 * Route handler for application get requests.
 * Retrieves the list of available applications.
 */
export async function getApplicationsHandler(request: Request, response: Response): Promise<any> {
    try {
        // if (!request.isAuthenticated()) {
        //     // send over an empty array if not authenticated
        //     response.json([]);
        //     return;
        // }
        const user = request.user ? <CurrentUser>request.user : undefined;
        // console.log("userk")
        // console.log(user);
        // if (!user) {
        //     logger.error('User serialization error in newVerificationCodeHandler, unable to cast user to CurrentUser');
        //     throw new Error('User serialization error in newVerificationCodeHandler, unable to cast user to CurrentUser')
        // }
        let results = await bedesQuery.app.getAllRecords(user);
        response.json(results)
    }
    catch (error) {
        logger.error('Error in getApplicationsHandler');
        logger.error(util.inspect(error));
        if (error instanceof BedesError) {
            response.status((<BedesError>error).responseStatusCode).send(error.responseMessage);
        }
        else {
            response.status(HttpStatusCodes.ServerError_500).send('Unknown error.');
        }
    }
}


