import {QueryFile} from 'pg-promise';
import * as path from 'path';
import {db} from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import {createLogger} from '@bedes-backend/logging';
import {IMappingApplication} from '@bedes-common/models/mapping-application';
import * as util from 'util';
import {BedesError} from '@bedes-common/bedes-error/bedes-error';
import {HttpStatusCodes} from '@bedes-common/enums/http-status-codes';
import {CurrentUser} from '@bedes-common/models/current-user/current-user';
import {ApplicationScope} from '@bedes-common/enums/application-scope.enum';
import {bedesQuery} from '..';
import {MappingApplicationQueryParams} from '@bedes-common/models/mapping-application/mapping-application-query-params';

const logger = createLogger(module);


/**
 * Defines the object signature for records returned from the insert-app-permisions query.
 */
interface IInsertPermissionResult {
    id: number;
}

export class AppQuery {
    private sqlGet: QueryFile;
    private sqlGetById: QueryFile;
    private sqlGetAll: QueryFile;
    private sqlGetAllFromUser: QueryFile;
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlUpdateAdmin: QueryFile;
    private sqlUpdateScope: QueryFile;
    private sqlDelete: QueryFile;
    private sqlInsertPermission: QueryFile;
    private sqlRemovePermission: QueryFile;

    constructor() { 
        // load the sql queries
        this.sqlGet = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlGetById = sql_loader(path.join(__dirname, 'get-by-id.sql'));
        this.sqlGetAll = sql_loader(path.join(__dirname, 'get-all.sql'));
        this.sqlGetAllFromUser = sql_loader(path.join(__dirname, 'get-all-from-user.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'));
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'));
        this.sqlUpdateAdmin = sql_loader(path.join(__dirname, 'update-admin.sql'));
        this.sqlUpdateScope = sql_loader(path.join(__dirname, 'update-scope.sql'));
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'));
        this.sqlInsertPermission = sql_loader(path.join(__dirname, 'insert-app-permisions.sql'));
        this.sqlRemovePermission = sql_loader(path.join(__dirname, 'remove-app-permisions.sql'));
    }

    /**
     * Insert a new application record.
     */
    public async newRecord(user: CurrentUser, item: IMappingApplication, transaction?: any): Promise<IMappingApplication> {
        try {
            // run this inside a transaction if not already
            if (!transaction) {
                return db.tx('new-application-trans', (trans: any) => {
                    return this.newRecord(user, item, trans);
                })
            }
            // check the required parameters
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing parameters`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    "Missing required parameters."
                );
            }
            // else if (!user || !user.isLoggedIn() || !user.canEditApplication(item._id)) {
            //     throw new BedesError(
            //         'Unauthorized',
            //         HttpStatusCodes.Unauthorized_401,
            //         'Unauthorized'
            //     );
            // }
            // build the parameters
            const params = {
                _name: item._name,
                _description: item._description,
                _scopeId: item._scopeId
            };
            // run the query
            const ctx = transaction || db;
            const newItem: IMappingApplication = await ctx.one(this.sqlInsert, params);
            if (!newItem || !newItem._id) {
                throw new BedesError(
                    'Unknown error occurred writing application',
                    HttpStatusCodes.ServerError_500,
                    'Unknown error occurred writing application'
                );
            }
            // set the permissions
            await this.setAppPermissions(user, newItem, transaction);
            return newItem;
        } catch (error) {
            console.log(error);
            // Duplicate record
            if (error && error.code === "23505") {
                logger.info(`MappingApplication ${item._name} already exists`);
                throw new BedesError(
                    'Application name already exists.',
                    HttpStatusCodes.BadRequest_400,
                    'Application name already exists.',
                );
            }
            else {
                // all other errors
                throw error;
            }
        }
    }

    public async setAppPermissions(user: CurrentUser, app: IMappingApplication, transaction?: any): Promise<IInsertPermissionResult> {
        try {
            // first remove the current permissions
            await this.removeAppPermissions(user, app, transaction);
            // build the params for the new permission
            const params = {
                _appId: app._id,
                _roleId: 1,
                _userId: user.id
            }
            // write the record
            const ctx = transaction || db;
            return ctx.one(this.sqlInsertPermission, params, transaction);
        }
        catch (error) {
            console.log(error);
            logger.error(`${this.constructor.name}: error in setAppPermissions.`);
            throw error;
        }
    }

    public async removeAppPermissions(user: CurrentUser, app: IMappingApplication, transaction?: any): Promise<IInsertPermissionResult> {
        try {
            const params = {
                _appId: app._id,
                _userId: user.id
            }
            const ctx = transaction || db;
            return ctx.none(this.sqlRemovePermission, params);
        }
        catch (error) {
            console.log(error);
            logger.error(`${this.constructor.name}: error in setAppPermissions.`);
            throw error;
        }
    }

    /**
     * Update an existing MappingApplication object/record.
     */
    public async updateRecord(currentUser: CurrentUser, item: IMappingApplication, transaction?: any): Promise<IMappingApplication> {
        try {
            // make sure required parameters are there
            if (!item._id || !item._name) {
                logger.error(`${this.constructor.name}: Missing parameters in updateRecord`);
                throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
            }
            // make sure the query runs inside a transaction context
            if (!transaction) {
                return db.tx('update-record-admin', (newTrans: any) => {
                    return this.updateRecord(currentUser, item, newTrans);
                });
            }
            // get the current record to see what the scope is
            const current = await this.getRecordById(currentUser, item._id);
            if (!current) {
                throw new BedesError('Error updating record.', HttpStatusCodes.ServerError_500);
            }
            // determine if scope is changing from private to public
            const scopeToPublic = current._scopeId === ApplicationScope.Private && item._scopeId === ApplicationScope.Public
                ? true
                : false;

            if (scopeToPublic) {
                // Set all corresponding private bedes composite terms to public
                await bedesQuery.compositeTerm.setApplicationCompositeTermsToPublic(currentUser, item._id, transaction);
            }

            const scopeToApproved = current._scopeId !== ApplicationScope.Approved && item._scopeId === ApplicationScope.Approved;
            if (scopeToApproved) {
                // Set all corresponding BEDES composite terms to approved
                await bedesQuery.compositeTerm.setApplicationCompositeTermsToApproved(currentUser, item._id, transaction);
            }

            // build the query parameters
            const params = {
                _id: item._id,
                _name: item._name,
                _description: item._description,
                _scopeId: item._scopeId
            };
            // determine the db transaction context for the query
            const ctx = transaction || db;
            if (scopeToApproved) {
                // Set ownership of the application to the administrative user approving it.
                await this.setAppPermissions(currentUser, item, transaction);
            }
            return ctx.one(this.sqlUpdateAdmin, params);
        } catch (error) {
            // Duplicate record
            if (error && error.code === "23505") {
                throw new BedesError(
                    'Application name already exists.',
                    HttpStatusCodes.BadRequest_400
                );
            }
            else {
                // all other errors
                throw error;
            }
        }
    }

    private async updateRecordAdmin(currentUser: CurrentUser, item: IMappingApplication, transaction?: any): Promise<IMappingApplication> {
        try {
            if (!currentUser.isAdmin()) {
                throw new BedesError('Unauthorized.', HttpStatusCodes.Unauthorized_401);
            }
            // make sure required parameters are there
            if (!item._id || !item._name) {
                logger.error(`${this.constructor.name}: Missing parameters in updateRecord`);
                throw new BedesError('Invalid parameters', HttpStatusCodes.BadRequest_400);
            }
            // make sure the query runs inside a transaction context
            if (!transaction) {
                return db.tx('update-record-admin', (newTrans: any) => {
                    return this.updateRecordAdmin(currentUser, item, newTrans);
                });
            }
            // get the current record to see what the scope is
            const current = await this.getRecordById(currentUser, item._id);
            if (!current) {
                throw new BedesError('Error updating record.', HttpStatusCodes.ServerError_500);
            }
            const scopeToPublic = current._scopeId !== item._scopeId && item._scopeId === ApplicationScope.Public
                ? true
                : false;

            if (scopeToPublic) {
                // Set all corresponding bedes composite terms to public
                await bedesQuery.compositeTerm.setApplicationCompositeTermsToPublic(currentUser, item._id, transaction);
            }

            // build the query parameters
            const params = {
                _id: item._id,
                _name: item._name,
                _description: item._description,
                _scopeId: item._scopeId
            };
            // determine the db transaction context for the query
            const ctx = transaction || db;
            return ctx.one(this.sqlUpdateAdmin, params);
        } catch (error) {
            // Duplicate record
            if (error && error.code === "23505") {
                throw new BedesError(
                    'Application name already exists.',
                    HttpStatusCodes.BadRequest_400,
                    'Application name already exists.',
                );
            }
            else {
                // all other errors
                throw error;
            }
        }
    }

    /**
     * Updates the application scope for a given MappingApplication
     *
     * @param {IMappingApplication} item
     * @param {*} [transaction]
     * @returns {Promise<IMappingApplication>}
     * @memberof AppQuery
     */
    public updateScope(item: IMappingApplication, transaction?: any): Promise<IMappingApplication> {
        try {
            if (!item._id) {
                logger.error(`${this.constructor.name}: Missing parameters in updateRecord`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _id: item._id,
                _scopeId: item._scopeId
            };
            if (transaction) {
                return transaction.one(this.sqlUpdateScope, params);
            }
            else {
                return db.one(this.sqlUpdateScope, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateScope`);
            // logger.error(util.inspect(error));
            console.log(error);
            throw new BedesError(
                'Error updating the application scope',
                HttpStatusCodes.ServerError_500,
                'Error updating record'
            )
        }
    }

    /**
     * Retrieve an application record by name.
     */
    public getRecord(name: string, transaction?: any): Promise<IMappingApplication> {
        try {
            if (!name) {
                logger.error(`${this.constructor.name}: Missing name in getRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: name
            };
            if (transaction) {
                return transaction.one(this.sqlGet, params);
            }
            else {
                return db.one(this.sqlGet, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieve an application record by its id.
     */
    public getRecordById(currentUser: CurrentUser, id: number, transaction?: any): Promise<IMappingApplication> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Invalid parameters.`);
                throw new BedesError('Invalid parameteres.', HttpStatusCodes.BadRequest_400);
            }
            const params = {
                _id: id,
                _userId: currentUser.id
            };
            const ctx = transaction || db;
            return ctx.one(this.sqlGetById, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }


    /**
     * Delete a MappingApplication record with the given id.
     * 
     * @returns {number} The number of rows deleted.
     */
    public async deleteRecord(id: number, transaction?: any): Promise<number> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: deleteRecord expected an id, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.result(this.sqlDelete, params, (r: any) => r.rowCount);
            }
            else {
                return db.result(this.sqlDelete, params, (r: any) => r.rowCount);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves the list of available applications.
     * If ther are no applications available an empty array is returned.
     */
    public getAllRecords(currentUser?: CurrentUser, transaction?: any, queryParams?: MappingApplicationQueryParams): Promise<Array<IMappingApplication>> {
        try {
            const ctx = transaction || db;
            const appScopes = queryParams?.includePublic ? [3, 4] : [4];
            if (currentUser) {
                const params = {
                    _userId: currentUser.id,
                    _scopes: appScopes,
                }
                return ctx.manyOrNone(this.sqlGetAllFromUser, params);
            }
            else {
                const params = {
                    _scopes: appScopes,
                }
                return ctx.manyOrNone(this.sqlGetAll, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllRecords`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieve all MappingApplications for a specific user.
     * @param user 
     * @param [transaction] 
     */
    public getAllRecordsFromUser(user: CurrentUser, transaction?: any): Promise<Array<IMappingApplication>> {
        try {
            const ctx = transaction || db;
            const params = {
                _userId: user.id
            }
            console.log('user records...')
            console.log(params);
            return ctx.manyOrNone(this.sqlGetAllFromUser, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllRecords`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
