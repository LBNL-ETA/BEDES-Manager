import { postman } from '../../postman';
import { authQuery } from '../query';

import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { INewRegistrationCodeResults } from '../interfaces/new-registration-code-results.interface';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
const logger = createLogger(module);

export async function sendVerificationCode(user: IUserProfile): Promise<boolean> {
    try {
        const results: INewRegistrationCodeResults = await authQuery.newRegistrationCode(user);
        logger.debug('registration code ==');
        logger.debug(util.inspect(results));
        const verificationCode = results.registrationCode;
        const host = (process.env.MODE === 'production' ? 'https://bedes-manager.lbl.gov' : 'http://localhost:4200');
        const message = `
            <html>
            ${user.firstName} ${user.lastName},
            <p>
                Thank you for your interest in the BEDES Manager.
                To continue your registration, log in using your email address and password,
                then enter the validation code below when requested.
            </p>
            <p>
                <a href="${host}/login/verify;verificationCode=${verificationCode}">Click here to verify</a>
            </p>
            <p>
                Verification code: ${verificationCode}
            </p>
            <p>
                Thank you
            </p>
            </html>
        `;
        return postman.sendEmail(String(user.email), 'BEDES Manager Verification', message)
    }
    catch (error) {
        logger.error('error sending verification email');
        logger.error(util.inspect(error));
        throw error;
    }
}
