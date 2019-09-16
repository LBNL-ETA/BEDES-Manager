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
import { INewRegistrationCodeResults } from '../interfaces/new-registration-code-results.interface';
import { BedesError } from '@bedes-common/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { IUserProfile } from '@bedes-common/models/authentication/user-profile';
import { ICurrentUserAuth } from '../models/current-user-auth/current-user-auth.interface';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { IGetVerificationCodeResult } from './get-verification-code/get-verification-code-result.interface';
import { PasswordUpdateAuth } from '../models/password-update-auth';
import { v4 } from 'uuid';
import { isUUID } from '@bedes-common/util/is-uuid';
import { IValidToken } from '../models/password-reset-updater';

class AuthQuery {
    private sqlGetByEmail!: QueryFile;
    private sqlGetById!: QueryFile;
    private sqlGetByUUID: QueryFile;
    private sqlAddUser!: QueryFile;
    private sqlUpdateUser!: QueryFile;
    private sqlUpdateUserStatus!: QueryFile;
    private sqlGetUserStatus!: QueryFile;
    private sqlUpdateUserPassword!: QueryFile;
    private sqlNewRegistrationCode!: QueryFile;
    private sqlGetRegistrationCode!: QueryFile;
    private sqlRemoveRegistrationCode!: QueryFile;
    private sqlInsertPwCode: QueryFile;
    private sqlDeletePwCode: QueryFile;

    constructor() { 
        this.sqlGetByEmail = sqlLoader(path.join(__dirname, 'getByEmail.sql'));
        this.sqlGetById = sqlLoader(path.join(__dirname, 'getById.sql'));
        this.sqlGetByUUID = sqlLoader(path.join(__dirname, 'getByUUID.sql'));
        this.sqlAddUser = sqlLoader(path.join(__dirname, 'addUser.sql'));
        this.sqlUpdateUser = sqlLoader(path.join(__dirname, 'updateUser.sql'));
        this.sqlGetUserStatus = sqlLoader(path.join(__dirname, 'getUserStatus.sql'));
        this.sqlUpdateUserPassword = sqlLoader(path.join(__dirname, 'updateUserPassword.sql'));
        this.sqlUpdateUserStatus = sqlLoader(path.join(__dirname, 'updateUserStatus.sql'));
        this.sqlNewRegistrationCode = sqlLoader(path.join(__dirname, 'newRegistrationCode.sql'));
        this.sqlGetRegistrationCode = sqlLoader(path.join(__dirname, 'get-verification-code/getVerificationCode.sql'));
        this.sqlRemoveRegistrationCode = sqlLoader(path.join(__dirname, 'removeRegistrationCode.sql'));
        this.sqlInsertPwCode = sqlLoader(path.join(__dirname, 'insert-pw-code.sql'));
        this.sqlDeletePwCode = sqlLoader(path.join(__dirname, 'delete-pw-code.sql'));
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
     * Get a UserProfile record by uuid 
     */
    public async getByUUID(uuid: string, transaction?: any): Promise<ICurrentUserAuth> {
        try {
            if (!isUUID(uuid)) {
                throw new BedesError('Invalid parameters.', HttpStatusCodes.BadRequest_400);
            }
            // build the query params
            const params = { uuid };
            const ctx = transaction || db;
            return ctx.one(this.sqlGetByUUID, params);
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in getByUUID.`);
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
            const hashPassword = await user.hashPassword()
            const params = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                organization: user.organization,
                password: hashPassword,
                uuid: v4()
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
        return db.result(this.sqlUpdateUser, {
            id: +user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }, (r: any) => r.rowCount);
    }

    /**
     * Updates a user password.
     */
    public async updateUserPassword(userId: number, passwordUpdate: PasswordUpdateAuth, trans?: any): Promise<void> {
        try {
            // hash the password
            const passwordHash = await passwordUpdate.hashPassword();
            // create the query params
            const params = {
                id: userId,
                passwordHash: passwordHash
            }
            const ctx = trans || db;
            return ctx.none(this.sqlUpdateUserPassword, params);
        } catch (error) {
            console.log('Error updating the user password');
            console.log(error);
            throw new BedesError('Error updating the user password', HttpStatusCodes.ServerError_500);
            
        }
    }

    /**
     * Retrieve the current user status.
     */
    public getUserStatus(userId: number): Promise<ICurrentUser> {
        return db.one(this.sqlGetUserStatus, {userId: userId});
    }

    public updateUserStatus(userId: number, status: UserStatus, transaction: any): Promise<UserStatus> {
        try {
            const ctx = transaction || db;
            return ctx.one(this.sqlUpdateUserStatus, {userId: userId, status: status})
                .then((results: {status: number}) => {
                    return results.status;
                });
        }
        catch (error) {
            logger.error(`${this.constructor.name}: error in updateUserStatus`);
            console.log(error);
            throw error;
        }
    }

    /**
     * Insert a password reset token, returning the uuid linked to the user's request
     * @returns password reset token 
     */
    public async getPasswordResetToken(userId: number, trans: any): Promise<string> {
        try {
            // create a new uuid
            const params = {
                userId: userId,
                uuid: v4()
            }
            const result = await trans.one(this.sqlInsertPwCode, params)
            return result.uuid;
            
        }
        catch (error) {
            console.log('error inserting password reset token');
            console.log(error);
            throw error;
        }

    }

    public async validatePasswordResetToken(userId: number, token: string, trans: any): Promise<IValidToken> {
        try {
            // create a new uuid
            const params = {
                userId: userId,
                uuid: token
            }
            return trans.one(this.sqlDeletePwCode, params)
            
        }
        catch (error) {
            console.log('error inserting password reset token');
            console.log(error);
            throw error;
        }

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

    /**
     * Validate a registration code for a given user.
     *
     * @param user The CurrentUser record for the user in question (usually from req.user).
     * @param registrationCode The verification code to validate.
     * @returns A Promise which resolves to a CurrentUser object that reflects the status
     *      of the user getting their cod verified.
     */
    public async validateVerificationCode(
        user: CurrentUser,
        registrationCode: string,
        transaction?: any
    ): Promise<boolean> {
        try {
            // create the params for retrieving the verification code record
            const getParams = {
                _userId: user.id,
                _registrationCode: registrationCode
            };
            // get the verification code record
            const result: IGetVerificationCodeResult= await db.oneOrNone(this.sqlGetRegistrationCode, getParams);
            // make sure a valid object is returned
            if (!result || !result._id) {
                // not a valid record returned
                throw new BedesError(
                    'Invalid parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Invalid parameters.'
                );
            }
            else if (!result._isValid) {
                // valid record, but not a valid code (time expired)
                throw new BedesError(
                    'Verification code expired.',
                    HttpStatusCodes.BadRequest_400,
                    'Verification code expired.'
                )
            }
            // valid registration codes...
            // wrap the cleanup process in a transaction
            const saveFunction = async (transaction: any): Promise<boolean> => {
                // array of promises
                const promises = new Array<Promise<any>>();
                // remove the verification code record
                // create the query params
                const removeParams = {
                    _userId: user.id
                }
                // run the query to remove the verification code
                promises.push(
                    transaction.none(this.sqlRemoveRegistrationCode, removeParams)
                );
                // update the user status to the next step - TOS
                const updateParams = {
                    userId: user.id,
                    status: UserStatus.IsLoggedIn
                };
                promises.push(
                    transaction.one(this.sqlUpdateUserStatus, updateParams)
                );
                await Promise.all(promises);
                return true;
            }
            // run the queries in a transaction
            // create a new transaction context if none is given.
            if (transaction) {
                return saveFunction(transaction);
            }
            else {
                return db.tx('verification-trans', saveFunction);
            }
        }
        catch(error) {
            logger.error('Error validation verificationCode');
            console.log(error);
            throw error;
        }
    }

}

const authQuery = new AuthQuery();
export { authQuery };
