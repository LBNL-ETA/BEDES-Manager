import { Request, Response } from 'express';
import * as util from 'util';
import { authQuery } from '../query';
import { UserPasswordUpdate } from '../models/user-password-update';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

export function updatePassword(req: Request, res: Response): void {
    // Make sure user is logged in
    if (!req.isAuthenticated() || !req.user || !req.user.id) {
        res.status(401).send('Unauthorized');
        return;
    }
    res.status(500).send('not implemented');
    // const user = new UserPasswordUpdate(
    //     req.user.id,
    //     req.body.password,
    //     req.body.passwordConfirm
    // );
    // if (user.isValid()) {
    //     authQuery.updateUserPassword(user).then(
    //         () => {
    //             logger.info('update password success');
    //             authQuery.updateUserStatus(+user.id, UserStatus.OK)
    //             .then((result: any) => {
    //                 logger.debug(`user status for user ${user.id} changed to ${UserStatus.OK}`);
    //                 res.status(200).send();
    //             })
    //             .catch((error: Error) => {
    //                 logger.error('error updating user status');
    //                 logger.error(util.inspect(error));
    //                 res.status(500).send('Error updating user status');
    //             });
    //             res.status(200).send()
    //         },
    //         (error: Error) => {
    //             logger.info('An error occurred updating the password.');
    //             logger.info(util.inspect(error));
    //             res.status(500).send('An error occurred updating the password.')
    //         }
    //     )
    // }
}
