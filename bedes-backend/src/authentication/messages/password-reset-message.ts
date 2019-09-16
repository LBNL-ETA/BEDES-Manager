import { bedesPostman } from '../../postman';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { ICurrentUserAuth } from '../models/current-user-auth';
const logger = createLogger(module);

export async function sendPasswordResetMessage(
    user: ICurrentUserAuth,
    token: string
): Promise<boolean> {
    try {
        const host = process.env.HTTP_HOST || 'http://localhost:4200';
        const url = `${host}/home/password-reset`
        const message = `
            <html>
            ${user._firstName} ${user._lastName},
            <p>
                Your password has been reset.
                Click the link below to set your new password.
            </p>
            <p>
                <a href="${url}/${user._uuid}/${token}">
                    Click here to set your new password
                </a>
            </p>
            <p>
                Thank you
            </p>
            </html>
        `;
        return bedesPostman.sendEmail(String(user._email), 'BEDES Manager Account', message)
    }
    catch (error) {
        logger.error('error sending verification email');
        logger.error(util.inspect(error));
        throw error;
    }
}
