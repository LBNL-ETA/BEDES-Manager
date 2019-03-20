import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { getAuthenticatedUser } from '@bedes-backend/util/get-authenticated-user';
const logger = createLogger(module);


/**
 * Retrieves the the login-status of the user, if applicable
 */
export function status(request: Request, response: Response): void {
    try {
        if (request.isAuthenticated()) {
            response.json(getAuthenticatedUser(request))
        }
        else {
            response.json(CurrentUser.makeDefaultUser());
        }
    }
    catch (error) {
        logger.error('Error checking user status');
        logger.error(util.inspect(error));
    }
}
