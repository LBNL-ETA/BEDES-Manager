import { bedesPostman } from '@bedes-backend/postman';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
const logger = createLogger(module);

/**
 * Sends an email message to a new user with new account details.
 *
 * @export
 * @param {UserProfileNew} user
 */
export function sendPasswordResetMessage(user: IUserProfile, password: string) {
    logger.debug(`send a password reset message to ${user.email}`);
    const message = `
    <html>
    ${user.firstName} ${user.lastName},
    <p>
        Your password has been reset.
        Once you log in with the temporary password listed below,
        you will be required to create a new password.
    </p>
    <p>
        <a href="host/login">Click here to login</a>
    </p>
    <p>
        Temporary Password : ${ password }
    </p>
    <p>
        Thank you
    </p>
    </html>
    `;
    bedesPostman.sendEmail(user.email, 'Password Reset', message)
    .then((results: any) => {
        logger.debug('password reset email sent...');
        logger.debug(results);
    })
    .catch((error: Error) => {
        logger.debug('error sending verification email');
        logger.error(util.inspect(error));
    });
}
