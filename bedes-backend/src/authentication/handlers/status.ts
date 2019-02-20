import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { authQuery } from '../query';
import { ICurrentUser } from '@bedes-common/models/current-user';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '../../../../bedes-common/models/current-user/current-user';
const logger = createLogger(module);


/**
 * Retrieves the the login-status of the user, if applicable
 */
export function status(req: Request, res: Response): void {
    try {
        
        console.log('check login status');
        console.log(req.user);
        if (req.user) {
            res.json(req.user);
        }
        else {
            res.json(CurrentUser.makeDefaultUser());
        }
        // if (req.isAuthenticated()) {
        //     authQuery.getUserStatus(req.user.id)
        //         .then((results: ICurrentUser) => {
        //             logger.debug('checked login status...', req.user.email);
        //             logger.debug(util.inspect(results));
        //             // Add in the current user email
        //             results._name = req.user.email;
        //             res.status(200).json(results);
        //         })
        //         .catch((error: any) => {
        //             console.log('error checking user status');
        //             console.log(error);
        //             res.status(500).send('Error checking verification status');
        //         });

        // }
        // else {
        //     console.log('not logged in');
        //     res.status(200).send(CurrentUser.makeDefaultUser());
        // }
    }
    catch (error) {
        logger.error('Error checking user status');
        logger.error(util.inspect(error));
    }
}

