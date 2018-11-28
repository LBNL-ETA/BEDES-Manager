import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { authQuery } from '../query';
const logger = createLogger(module);

/**
 * Validate a user registration code
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
export async function verifyRegistrationCode(req: Request, res: Response): Promise<any> {
    try {
        logger.info('verify registration code');
        // must be logged in to validate
        if (!req.isAuthenticated()) {
            logger.warn('User not authenticated');
            res.status(HttpStatusCodes.Unauthorized_401).send('Unauthorized');
            return;
        }
        const registrationCode = req.body.verificationCode;
        if (!registrationCode) {
            res.status(HttpStatusCodes.BadRequest_400).send('Invalid parameters.');
            return;
        }
        logger.debug(`verify registration code (${req.user.id}, ${registrationCode})`)
        const newStatus = await authQuery.validateRegistrationCode(req.user.id, registrationCode);
        // user is authenticated
        res.status(200).send(newStatus);
    }
    catch(error) {
        logger.error('Error occured validating user.');
        logger.error(util.inspect(error));
        res.status(500).send('An error occurred validating user authentication');
    }
}

