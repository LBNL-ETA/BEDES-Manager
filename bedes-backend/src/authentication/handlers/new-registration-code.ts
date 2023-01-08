import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { authQuery } from '../query';
import { sendVerificationCode } from '../messages';
const logger = createLogger(module);

/**
 * Handle requests for new registration codes.
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function newRegistrationCode(req: Request, res: Response): Promise<any> {
    try {
        logger.debug('get new registration code');
        // must be logged in to validate
        if (!req.isAuthenticated()) {
            logger.warn('User not authenticated');
            res.status(HttpStatusCodes.Unauthorized_401).send('Unauthorized');
            return;
        }
        // const newStatus = await authQuery.validateRegistrationCode(req.user.id, registrationCode);
        // @ts-ignore
        const verificationCodeResults = await sendVerificationCode(req.user);
        logger.debug(`send new registration code = ${verificationCodeResults}`);
        res.status(HttpStatusCodes.Created_201).json();
        // user is authenticated
        res.status(200).send();
    }
    catch(error) {
        logger.error('Error occured validating user.');
        logger.error(util.inspect(error));
        res.status(500).send('An error occurred validating user authentication');
    }
}


