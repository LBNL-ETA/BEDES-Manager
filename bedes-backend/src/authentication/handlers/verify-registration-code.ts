import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { authQuery } from '../query';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
const logger = createLogger(module);

/**
 * Validate a user registration code
 */
export async function verifyRegistrationCode(req: Request, res: Response): Promise<any> {
    try {
        logger.info('validate user');
        // user must be authenticated
        if (!req.isAuthenticated()) {
            logger.warn('User not authenticated');
            res.status(401).send('Unauthorized');
            return;
        }
        // get the current user info
        const user = <CurrentUser>req.user;
        if (!user) {
            logger.error('User serialization error in verifyCodeHandler, unable to cast user to CurrentUser');
            throw new Error('User serialization error in verifyCodeHandler, unable to cast user to CurrentUser')
        }
        const verificationCode: string = req.params.verificationCode;
        if (!verificationCode) {
            throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400, 'Invalid parameters');
        }
        logger.debug(`validate the code ${verificationCode}`);
        // user is authenticated
        // validate the code
        const result = await authQuery.validateVerificationCode(user, verificationCode);
        logger.debug(`done validating code`);
        console.log(result);
        res.json(result);
        // res.status(200).send(req.user);
        return;
    }
    catch(error) {
        logger.error('Error occured validating user.');
        logger.error(util.inspect(error));
        res.status(500).send('An error occurred validating user authentication');
    }
}

