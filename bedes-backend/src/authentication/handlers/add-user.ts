import { Request, Response } from 'express';
import * as util from 'util';

import { UserProfileNew } from '../models/user-profile-new';
import { authQuery } from '../query';

import { createLogger } from '@bedes-backend/logging';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { sendVerificationCode } from '../messages';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
import { AccountCreater } from '../models/account-creater';
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
        const creater = new AccountCreater(user);
        const result = await creater.run();

        if (result) {
            res.status(HttpStatusCodes.Created_201).json();
        }
        else {
            res.status(HttpStatusCodes.ServerError_500)
                .send('An error occured creating the user account');
        }
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
