import { QueryFile } from 'pg-promise';
import * as randomstring from 'randomstring';
import * as path from 'path';
import * as util from 'util';
import { db, sqlLoader } from '@bedes-backend/db';

import { UserProfileUpdate } from '../models/user-profile-update';
import { UserProfileNew } from '../models/user-profile-new';
import { ICurrentUser } from '@bedes-common/models/current-user';

import { createLogger } from '@bedes-backend/logging';
const logger = createLogger(module);
import { UserPasswordUpdate } from '../models/user-password-update';
import { INewRegistrationCodeResults } from '../interfaces/new-registration-code-results.interface';
import { IValidateRegistrationCodeResult } from '../interfaces/validate-registration-code-result.interface';
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
import { ICurrentUserAuth } from '../models/current-user-auth/current-user-auth.interface';

class AuthQuery {
    private sqlGetByEmail!: QueryFile;
    private sqlGetById!: QueryFile;
    private sqlAddUser!: QueryFile;
    private sqlUpdateUser!: QueryFile;
    private sqlUpdateUserStatus!: QueryFile;
    private sqlGetUserStatus!: QueryFile;
    private sqlUpdateUserPassword!: QueryFile;
    private sqlNewRegistrationCode!: QueryFile;
    private sqlGetRegistrationCode!: QueryFile;
    private sqlRemoveRegistrationCode!: QueryFile;

    constructor() { 
        this.initSql();
    }

    /**
     * Loads the sql queries.
     *
     * @private
     * @memberof User
     */
    private initSql(): void {
        this.sqlGetByEmail = sqlLoader(path.join(__dirname, 'getByEmail.sql'));
        this.sqlGetById = sqlLoader(path.join(__dirname, 'getById.sql'));
        this.sqlAddUser = sqlLoader(path.join(__dirname, 'addUser.sql'));
        this.sqlUpdateUser = sqlLoader(path.join(__dirname, 'updateUser.sql'));
        this.sqlGetUserStatus = sqlLoader(path.join(__dirname, 'getUserStatus.sql'));
        this.sqlUpdateUserPassword = sqlLoader(path.join(__dirname, 'updateUserPassword.sql'));
        this.sqlUpdateUserStatus = sqlLoader(path.join(__dirname, 'updateUserStatus.sql'));
        this.sqlNewRegistrationCode = sqlLoader(path.join(__dirname, 'newRegistrationCode.sql'));
        this.sqlGetRegistrationCode = sqlLoader(path.join(__dirname, 'getRegistrationCode.sql'));
        this.sqlRemoveRegistrationCode = sqlLoader(path.join(__dirname, 'removeRegistrationCode.sql'));
    }

    /**
     * Retrieves a record by email address.
     */
    public getByEmail(email: string, transaction?: any): Promise<ICurrentUserAuth> {
        try {
            if (!email || typeof email !== 'string') {
                logger.error(`${this.constructor.name}: getByEmail expects an email`);
                throw new BedesError('Invalid parameters.', HttpStatusCodes.BadRequest_400, 'Invalid parameters.');
            }
            // build the query params
            const params = {
                _email: email.trim()
            }
            // set the db context:
            // either run the query in the given transaction context
            // or run the query by itself
            const ctx = transaction || db;
            return ctx.oneOrNone(this.sqlGetByEmail, params);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in getByEmail.`);
            console.log(error);
            throw error;
        }
    }

    /**
     * Get a UserProfile record by id
     * @param id The id of the user to query.
     */
    public async getById(id: number, transaction?: any): Promise<ICurrentUserAuth> {
        try {
            if (!id || typeof id !== 'number') {
                logger.error(`${this.constructor.name}: getById expects an id`);
                throw new BedesError('Invalid parameters.', HttpStatusCodes.BadRequest_400, 'Invalid parameters.');
            }
            // build the query params
            const params = {
                _id: id 
            }
            // set the db context:
            // either run the query in the given transaction context
            // or run the query by itself
            const ctx = transaction || db;
            return ctx.one(this.sqlGetById, params);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in getById.`);
            console.log(error);
            throw error;
        }
    }

    /**
     * Add a new UserProfile record.
     *
     * @param {UserProfileNew} user
     * @returns {*}
     * @memberof AuthQuery
     */
    public async addUser(user: UserProfileNew): Promise<IUserProfile>{
        try {
            logger.info(`Added new user ${user}`);
            const hashPassword = await user.hashPassword()
            const params = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                organization: user.organization,
                password: hashPassword
            };
            return db.one(this.sqlAddUser, params);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: addUser error`);
            logger.error(error);
            throw error;
        }
    }

    /**
     * Updates an existing user profile record.
     *
     * @param {UserProfileUpdate} user
     * @returns {*}
     * @memberof AuthQuery
     */
    public updateUser(user: UserProfileUpdate): any {
        logger.info(`Added new user ${user}`);
        return db.result(this.sqlUpdateUser, {
            id: +user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }, (r: any) => r.rowCount);
    }

    /**
     * Updates a user password.
     *
     * @param {number} id
     * @param {string} passwordHash
     * @returns {*}
     * @memberof AuthQuery
     */
    public updateUserPassword(user: UserPasswordUpdate): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // first hash the password
            user.hashPassword().then(
                (passwordHash: string) => {
                    // update the db with the new hashed password
                    db.result(this.sqlUpdateUserPassword, {
                        id: +user.id,
                        passwordHash: passwordHash
                    }, (r: any) => r.rowCount).then(
                        (results) => {
                            // update password success!
                            // TODO: check results for success?
                            logger.debug('updateUserPassword success');
                            logger.debug(results);
                            resolve(true);
                        }
                    )
                },
                (error) => {
                    reject();
                }
            )
        });
    }

    /**
     * Retrieve the current user status.
     *
     * @param {number} userId
     * @returns {*}
     * @memberof AuthQuery
     */
    public getUserStatus(userId: number): Promise<ICurrentUser> {
        console.log('getUserStatus');
        console.log(userId);
        return db.one(this.sqlGetUserStatus, {userId: userId});
    }

    public updateUserStatus(userId: number, status: number): Promise<ICurrentUser> {
        return db.one(this.sqlUpdateUserStatus, {userId: userId, status: status});
    }

    /**
     * create a new registration code record for a user.
     * 
     * @param {*} user 
     * @returns {*} 
     * @memberof User
     */
    public newRegistrationCode(user: any): Promise<INewRegistrationCodeResults> {
        try {
            // generate a random 7 character string
            const registrationCode = randomstring.generate(7);
            return db.one(this.sqlNewRegistrationCode, {
                userId: user.id,
                registrationCode: registrationCode
            });
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in newRegistrationCode`);
            logger.error(util.inspect(user));
            logger.error(util.inspect(error));
            throw error;
        }
    }

    public async removeRegistrationCode(id: number): Promise<any> {
        try {
            const params = {
                id: id
            };
            return db.result(this.sqlRemoveRegistrationCode, params);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in removeRegistrationCode(${id})`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    public async validateRegistrationCode(userId: number, registrationCode: string): Promise<ICurrentUser> {
        try {
            const params = {
                userId: userId,
                registrationCode: registrationCode
            };
            const validationResult: IValidateRegistrationCodeResult = await db.oneOrNone(this.sqlGetRegistrationCode, params);
            console.log('validation success');
            console.log(validationResult);
            if (!validationResult || !validationResult.id) {
                logger.error(`${this.constructor.name}: expected getRegistrationCode(${userId}, '${registrationCode}'`);
                throw new BedesError(
                    `${this.constructor.name}: expected getRegistrationCode(${userId}, '${registrationCode}'`,
                    HttpStatusCodes.BadRequest_400,
                    'Invalid or Expired Registration Code'
                )
            }
            else if (!validationResult.isValid) {
                // this.removeRegistrationCode(validationResult.id);
                logger.error(`invalid verification code encountered for user ${userId}, code ${registrationCode}`);
                throw new BedesError('Registration code expired.', HttpStatusCodes.BadRequest_400, 'Registration code expired.');
            }
            // validation result is valid
            // remove the verification code
            this.removeRegistrationCode(validationResult.id);
            // update the user status
            return this.updateUserStatus(userId, UserStatus.IsLoggedIn);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in validateRegistrationCode(${userId}, '${registrationCode})`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

}

const authQuery = new AuthQuery();
export { authQuery };
