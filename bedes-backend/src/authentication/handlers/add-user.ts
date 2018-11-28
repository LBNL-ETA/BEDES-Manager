import { Request, Response } from 'express';
import * as util from 'util';

import { UserProfileNew } from '../models/user-profile-new';
import { authQuery } from '../query';

import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { sendVerificationCode } from '../messages';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
const logger = createLogger(module);

/**
 * Processes requests for new user accounts.
 * 
 * The function reads in the new user information from the request body.
 * The function body is wraped with a promise to allow unit testing.
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export async function addUser(req: Request, res: Response): Promise<any> {
    try {
        // try and create the new user object
        let user: UserProfileNew;
        user = new UserProfileNew(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.organization,
            req.body.password,
            req.body.passwordConfirm
        );
        logger.debug('create user');
        logger.debug(util.inspect(user));
        if (!user.isValid()) {
            res.status(HttpStatusCodes.BadRequest_400).send('Invalid parameters.');
            return;
        }
        // try creating the user record in the database
        const newUser: IUserProfile = await authQuery.addUser(user);
        // user record has been created
        logger.debug(`user ${user.email} successfully created`);
        logger.debug(util.inspect(newUser));
        // send the new account email to the user
        const verificationCodeResults = await sendVerificationCode(newUser);
        res.status(HttpStatusCodes.Created_201).json();
        return;

    }
    catch (error) {
        logger.error(`Error creating new user record ${req.body.email}`);
        logger.error(util.inspect(error));
        logger.error(util.inspect(req.body));
        logger.error(`error code = ${error.code}`)
        // PostgreSQL error 23505 is a unique index error
        // see https://www.postgresql.org/docs/current/static/errcodes-appendix.html
        if (error.code === '23505') {
            // user account already exists for that email address
            res.status(HttpStatusCodes.BadRequest_400).send(`An account for ${req.body.email} already exists.`);
        }
        else {
            // unknown server error
            res.status(HttpStatusCodes.ServerError_500).send('An error occured creating the user account.');
        }
    }
}
