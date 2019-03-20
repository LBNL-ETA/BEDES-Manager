import { Request } from 'express';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);
import { CurrentUser } from "@bedes-common/models/current-user";
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';

/**
 * Extract the authenticated user from the Express Request object.
 * See src/authintication/index for more details.
 * @param request 
 * @returns authenticated user 
 */
export function getAuthenticatedUser(request: Request): CurrentUser {
    try {
        // make sure the user is logged in
        if (!request.isAuthenticated()) {
            throw new BedesError(
                'Unauthorized',
                HttpStatusCodes.Unauthorized_401
            )
        }
        // get the current user info
        const currentUser = <CurrentUser>request.user;
        if (!currentUser || !currentUser.isValid()) {
            logger.error('User serialization error in compositeTermPostHandler, unable to cast user to CurrentUser');
            throw new Error('User serialization error in compositeTermPostHandler, unable to cast user to CurrentUser')
        }
        // user looks valid
        return currentUser;
    }
    catch (error) {
        console.log(`Error in getAuthenticatedUser'`);
        console.log(error);
        throw error;
    }

}