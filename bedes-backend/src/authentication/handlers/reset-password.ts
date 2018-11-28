import { Request, Response } from 'express';
import * as randomstring from 'randomstring';
import * as util from 'util';

import { authQuery } from '../query';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { sendPasswordResetMessage } from '..//messages/password-reset-message';
import { UserPasswordUpdate } from '../models/user-password-update';
import { createLogger } from '@bedes-backend/logging';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
const logger = createLogger(module);

/**
 * Reset a user's password.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export function resetPassword(req: Request, res: Response): void {
    const forgotEmail = req.body.forgotEmail;
    logger.debug(`user forgot password (${ forgotEmail })`);
    // email address is required
    if (!forgotEmail) {
        res.status(400).send('Invalid parameters');
        return;
    }
    res.status(500).send('not implemented');
    // get the user account info by email address
    // authQuery.getByEmail(forgotEmail)
    // .then((user: IUserProfile) => {
    //     // make sure there's a matching user record
    //     if (!user) {
    //         logger.warn(`User record for email ${forgotEmail} doesn't exist`);
    //         res.status(500).send('Error retreiving account information.');
    //         return;
    //     }
    //     const newPw = randomstring.generate(12);
    //     const userUpdate = new UserPasswordUpdate(
    //         user.id,
    //         newPw,
    //         newPw
    //     )
    //     if (!userUpdate.isValid()) {
    //         logger.error('UserPassword not valid in resetPassword()');
    //         res.status(404).send('Invalid Parameters');
    //         return;
    //     }
    //     authQuery.updateUserPassword(userUpdate)
    //     .then(() => {
    //         // password successfully updated
    //         // now update the user status back to ok
    //         authQuery.updateUserStatus(user.id, UserStatus.OK)
    //         .then((result: any) => {
    //             logger.debug('updated user status success');
    //             // send the new password via email
    //             sendPasswordResetMessage(user, newPw);
    //         })
    //         .catch((error: Error) => {
    //             logger.debug('update user status error');
    //             logger.error(util.inspect(error));
    //             res.status(500).send('Error updating user status.');
    //         })
    //     })
    //     .catch((error: Error) => {
    //         logger.debug('error updating password.');
    //         logger.error(util.inspect(error));
    //         res.status(500).send('An error occured reseting the password.');
    //     });
    // })
    // .catch((error: Error) => {
    //     logger.error('error retrieving account info');
    //     logger.error(util.inspect(error));
    //     res.status(500).send('Error retreiving account information.');
    // });
}
