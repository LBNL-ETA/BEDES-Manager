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

/**
 * Configures the passport library.
 *
 * @export
 */
export function authenticationConfig(express: express.Application): void {
    const LocalStrategy = passportLocal.Strategy;
    // Setup the user object that gets attached to the http request.
    // Once a user is logged in, an object conforming to 
    // the IUserProfile interface is attached to the request object.
    // A new modified Request object with the IUserProfile interface can be
    // found in ./interfaces/passport-request.ts
    serializeUser((user: IUserProfile, next) => {
        next(null, new UserProfile(user));
    });

    deserializeUser((user: IUserProfile, next) => {
        if (user.id) {
            authQuery.getById(user.id)
            .then((data: any) => {
                next(null, data);
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
    use(new LocalStrategy({ usernameField: "email" }, (email, password, next) => {
        console.log('authenticate user', email, password);
        // get the user record by email, ignoring case
        authQuery.getByEmail(email.toLowerCase())
        .then((user: any) => {
            if (!user) {
                logger.warn(`Account for email ${email} was not found.`)
                return next(null, false, { message: `Invalid credentials.` });
            }
            comparePassword(password, user.password).then(
                (isValid: boolean) => {
                    if (!isValid) {
                        logger.warn('Invalid password');
                        return next(null, false)
                    }
                    else {
                        return next(null, user)
                    }
                },
                (error: Error) => {
                    logger.error('Error occurred in comparePassword');
                    logger.error(util.inspect(error));
                    return next(error);
                }
            );
        })
        .catch((error: Error) => {
            logger.error('Error retrieving  user record.');
            logger.error(util.inspect(error));
            return next(error);
        });
    }));

    // register passport with express
    express.use(initialize());
    express.use(session());
}
