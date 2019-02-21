import { Request, Response } from 'express';
import * as util from 'util';
import { createLogger } from '@bedes-backend/logging';
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { authQuery } from '../query';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { PasswordUpdate } from '../../../../bedes-common/interfaces/password-update/password-update';
import { IPasswordUpdate } from '../../../../bedes-common/interfaces/password-update/password-update.interface';
import { PasswordUpdateAuth } from '../models/password-update-auth';
const logger = createLogger(module);

export async function updatePassword(req: Request, res: Response): Promise<any> {
    try {
        // user must be authenticated
        if (!req.isAuthenticated()) {
            res.status(401).send('Unauthorized');
            return;
        }
        // get the current user info
        const user = <CurrentUser>req.user;
        if (!user) {
            logger.error('User serialization error in verifyCodeHandler, unable to cast user to CurrentUser');
            throw new Error('User serialization error in verifyCodeHandler, unable to cast user to CurrentUser')
        }
        // get the PasswordUpdate
        const passwordUpdate = getPasswordUpdateObjct(req.body);
        if (!passwordUpdate || !passwordUpdate.isValid()) {
            throw new BedesError(
                'Invalid parameters',
                HttpStatusCodes.BadRequest_400,
                'Invalid parameters');
        }
        logger.debug(`password object is valid`);
        console.log(passwordUpdate);
        const result = await authQuery.updateUserPassword(user, passwordUpdate);
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


/**
 * Build the PasswordUpdate object from the request body.
 * @param body 
 * @returns The PasswordRequest object
 */
function getPasswordUpdateObjct(body: any): PasswordUpdateAuth {
    try {
        const data: IPasswordUpdate = body;
        return new PasswordUpdateAuth(data._passwordConfirm, data._passwordConfirm);
    }
    catch (error) {
        throw new BedesError(
            'Error parsing passwordUpdate object',
            HttpStatusCodes.BadRequest_400,
            'Error parsing passwordUpdate object',
        )
    }
}