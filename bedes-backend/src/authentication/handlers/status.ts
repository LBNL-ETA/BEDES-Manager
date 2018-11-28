import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { authQuery } from '../query';
import { IUserStatus } from '@bedes-common/interfaces/user-status';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
const logger = createLogger(module);


/**
 * Retrieves the the login-status of the user, if applicable
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export function status(req: Request, res: Response): void {
    try {
        console.log('check login status');
        console.log(req.user);
        if (req.isAuthenticated()) {
            authQuery.getUserStatus(req.user.id)
                .then((results: IUserStatus) => {
                    logger.debug('checked login status...');
                    logger.debug(util.inspect(results));
                    res.status(200).json(results);
                })
                .catch((error: any) => {
                    console.log('error checking user status');
                    console.log(error);
                    res.status(500).send('Error checking verification status');
                });

        }
        else {
            console.log('not logged in');
            res.status(200).send(<IUserStatus>{ status: UserStatus.NotLoggedIn });
        }
    }
    catch (error) {
        logger.error('Error checking user status');
        logger.error(util.inspect(error));
    }
}

