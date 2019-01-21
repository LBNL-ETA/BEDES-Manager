import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import * as util from 'util';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';

export class AppQuery {
    private sqlGet: QueryFile;
    private sqlGetAll: QueryFile;
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlUpdateScope: QueryFile;
    private sqlDelete: QueryFile;

    constructor() { 
        // load the sql queries
        this.sqlGet = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlGetAll = sql_loader(path.join(__dirname, 'get-all.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
        this.sqlUpdateScope = sql_loader(path.join(__dirname, 'update-scope.sql'))
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'))
    }

    /**
     * Insert a new application record.
     */
    public async newRecord(item: IMappingApplication, transaction?: any): Promise<IMappingApplication> {
        try {
            if (!item._name || !item._scopeId) {
                logger.error(`${this.constructor.name}: Missing parameters`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    "Missing required parameters."
                );
            }
            const params = {
                _name: item._name,
                _description: item._description,
                _scopeId: item._scopeId
            };
            if (transaction) {
                return await transaction.one(this.sqlInsert, params);
            }
            else {
                return await db.one(this.sqlInsert, params);
            }
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

    /**
     * Update an existing MappingApplication object/record.
     */
    public updateRecord(item: IMappingApplication, transaction?: any): Promise<IMappingApplication> {
        try {
            if (!item._name || !item._name) {
                logger.error(`${this.constructor.name}: Missing parameters in updateRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: item._id,
                _name: item._name,
                _description: item._description
            };
            if (transaction) {
                return transaction.one(this.sqlUpdate, params);
            }
            else {
                return db.one(this.sqlUpdate, params);
            }
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
    public getAllRecords(transaction?: any): Promise<Array<IMappingApplication>> {
        try {
            if (transaction) {
                return transaction.manyOrNone(this.sqlGetAll);
            }
            else {
                return db.manyOrNone(this.sqlGetAll);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllRecords`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
