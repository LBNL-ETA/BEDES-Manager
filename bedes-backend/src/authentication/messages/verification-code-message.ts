import { postman } from '@bedes-backend/postman';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

/**
 * Send a verification code to a user who just logged in.
 * Two-factory authentication can be turned off for specific users
 * by setting the two_factor boolean column in auth.user to false
 *
 * @export
 * @param {*} user
 * @param {*} res
 */
export function sendVerificationCodeMessage(user: any, res: any) {
    const htmlMessage = `
    <html>
        <div>
            <strong>First Name:</strong>
            <span></span>
        </div>
        <div>
            <strong>Last Name:</strong>
            <span></span>
        </div>
        <div>
            <strong>Email</strong>
            <span></span>
        </div>
        <div>
            <strong>Organization</strong>
            <span></span>
        </div>
        <div>
            New account
        </div>
    </html>
    `;
    // send the email
    // TODO: Handle situations where the email was actually sent or not,
    // right now there's no check
    postman.sendEmail('mspears@lbl.gov', 'New ePB Account', htmlMessage)
    .then((results: any) => {
        logger.debug('email successfully sent...');
        logger.debug(results);
    })
    .catch((error: Error) => {
        logger.error('error sending account notification email');
        logger.error(util.inspect(error));
    });
}
