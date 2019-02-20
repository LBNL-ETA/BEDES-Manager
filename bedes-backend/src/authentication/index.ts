import * as express from 'express';
import { serializeUser, deserializeUser, use, initialize, session } from 'passport';
import * as passportLocal from 'passport-local';
import * as util from 'util';

import { authQuery } from './query';
import {
    IUserProfile,
    UserProfile
} from '@bedes-common/models/authentication/user-profile';

import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);
import { comparePassword } from './lib/compare-password';
import { CurrentUser } from '../../../bedes-common/models/current-user/current-user';
import { ICurrentUser } from '@bedes-common/models/current-user';
import { ICurrentUserAuth } from './models/current-user-auth/current-user-auth.interface';
import { userInfo } from 'os';

interface ISerializedUserInfo {
    id: number;
}

/**
 * Configures the passport library.
 *
 * @export
 */
export function authenticationConfig(express: express.Application): void {
    // const LocalStrategy = passportLocal.Strategy;
    // // Setup the user object that gets attached to the http request.
    // // Once a user is logged in, an object conforming to 
    // // the IUserProfile interface is attached to the request object.
    // // A new modified Request object with the IUserProfile interface can be
    // // found in ./interfaces/passport-request.ts
    // serializeUser((user: IUserProfile, next) => {
    //     next(null, new UserProfile(user));
    // });

    // deserializeUser((user: IUserProfile, next) => {
    //     if (user.id) {
    //         authQuery.getById(user.id)
    //         .then((data: any) => {
    //             next(null, data);
    //         })
    //         .catch((error: Error) => {
    //             logger.error('Error deserializing the user.');
    //             logger.error(util.inspect(error));
    //             next(error);
    //         });
    //     }
    //     else {
    //         next(new Error('Deserialize User: invalid user_id.'));
    //     }
    // })
    const LocalStrategy = passportLocal.Strategy;
    serializeUser((user: CurrentUser, next) => {
        const userInfo: ISerializedUserInfo = {
            id: user.id
        }
        next(null, userInfo);
    });

    deserializeUser((userInfo: ISerializedUserInfo, next) => {
        if (userInfo.id) {
            authQuery.getById(userInfo.id)
            .then((data: ICurrentUser) => {
                next(null, new CurrentUser(data));
            })
            .catch((error: Error) => {
                logger.error('Error deserializing the user.');
                logger.error(util.inspect(error));
                next(error);
            });
        }
        else {
            next(new Error('Deserialize User: invalid user_id.'));
        }
    })


    // Use passport local-strategy for authetication
    // Authentication requires the keys 'email' and 'password'
    // to be passed into a POST request body.
    // The user record is then fetched and password compared.
    use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, next) => {
                // get the user record by email, ignoring case
                try {
                    console.log(`auth email ${email}`);
                    const searchEmail = email.trim().toLowerCase();
                    const user: ICurrentUserAuth = await authQuery.getByEmail(searchEmail);
                    console.log('user');
                    console.log(user);
                    // make sure a user object was returned
                    if (!user) {
                        logger.warn(`Account for email ${email} was not found.`)
                        return next(null, false, { message: `Invalid credentials.` });
                    }
                    else if (!user._password) {
                        // make sure a password is present to compare to
                        return next(null, false,  { message: `Invalid compare-to password` })
                    }
                    // now compare the password
                    comparePassword(password.trim(), user._password)
                    .then(
                        (isValid: boolean) => {
                            if (!isValid) {
                                logger.warn('Invalid password');
                                return next(null, false)
                            }
                            else {
                                return next(null, new CurrentUser(user))
                            }
                        },
                        (error: Error) => {
                            logger.error('Error occurred in comparePassword');
                            logger.error(util.inspect(error));
                            return next(error);
                        }
                    );
                } catch (error) {
                    logger.error('Error retrieving  user record.');
                    logger.error(util.inspect(error));
                    return next(error);
                }
            }
        )
    );

    // register passport with express
    express.use(initialize());
    express.use(session());
}
