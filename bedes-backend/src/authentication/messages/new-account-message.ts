import { bedesPostman } from '@bedes-backend/postman';
import { UserProfileNew } from '../models/user-profile-new';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

/**
 * Sends an email message to a new user with new account details.
 *
 * @export
 * @param {UserProfileNew} user
 */
function sendNewAccountMessage(user: UserProfileNew) {
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
    // TODO: Handle situations where the email was actually sent or not, right now there's no check
    bedesPostman.sendEmail('mspears@lbl.gov', 'New ePB Account', htmlMessage)
    .then((results: any) => {
        logger.debug('email successfully sent...');
        logger.debug(results);
    })
    .catch((error: Error) => {
        logger.error('error sending account notification email');
        logger.error(util.inspect(error));
    });
}
const message = {
    sendNewAccountMessage: sendNewAccountMessage
}
export { message }