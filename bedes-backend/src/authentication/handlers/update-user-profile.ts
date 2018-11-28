import { Request, Response } from 'express';
import * as util from 'util';

import { authQuery } from '../query';
import { UserProfileUpdate } from '../models/user-profile-update';
import { comparePassword } from '../lib/compare-password';

import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);

export function updateUserProfile(req: Request, res: Response): void {
    // Make sure user is logged in
    if (!req.isAuthenticated()) {
        res.status(401).send('Unauthorized');
        return;
    }
    // const oldEmail = req.user.email;
    // userAuthentication.updateUser(
    //     req.body.id,
    //     req.body.firstName,
    //     req.body.lastName,
    //     req.body.email,
    //     req.body.password
    // )
    // .then((data: any) => {
    //     logger.debug('update user success');
    //     logger.debug(data);
    //     const message = `<html>The email address associated with your account has been updated.</html>`;
    //     postman.sendEmail(oldEmail, 'ICE Calculator - Account Update', message);
    //     res.json(data);
    // })
    // .catch((error: Error) => {
    //     logger.debug('error updating user');
    //     logger.error(util.inspect(error));
    //     res.status(500).send('Error updating user');
    // });

    // TODO:  finish implementing new update code here
    // create the UserProfileUpdate object
    const userProfileUpdate = new UserProfileUpdate(
        req.body.id,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.password
    )

    // make sure an id value is supplied for retrieving the existing record
    if (!userProfileUpdate.id) {
        logger.warn(`Attempt to update user profile without id.`);
        res.status(404).send('Invalid parameters');
        return;
    }
    // query the user record by id
    authQuery.getById(userProfileUpdate.id)
    .then((user: any) => {
        // compare passwords
        comparePassword(userProfileUpdate.password, user.password).then(
            (results) => {
                if (results) {
                    authQuery.updateUser(userProfileUpdate)
                    .then((data: any) => {
                        res.status(200).send();
                    })
                    .catch((error: Error) => {
                        res.status(500).send('An error occurred updating the user record, data not saved.');
                    });
                }
                else {
                    res.status(500).send('Invalid credentials.');
                }
            },
            (error: any) => {
                logger.error('An error occured in comparePassword');
                logger.error(util.inspect(error));
                res.status(500).send('An authentication error occurred, data not saved.');
            }
        )
    })
    .catch((error: Error) => {
        logger.error('An error occured in authQuery.getById');
        logger.error(util.inspect(error));
        res.status(500).send('An error occurred retrieving the user record, data not saved');
    });
}
