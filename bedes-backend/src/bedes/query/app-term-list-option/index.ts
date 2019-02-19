import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IAppTermListOption } from '@bedes-common/models/app-term/app-term-list-option.interface';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { bedesQuery } from '..';

export class AppTermListOptionQuery {
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlDelete: QueryFile;
    private sqlDeleteByAppTermId: QueryFile;

    constructor() { 
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'))
        this.sqlDeleteByAppTermId = sql_loader(path.join(__dirname, 'delete-by-app-term-id.sql'))
    }

    /**
     * Saves an array of AppTermListOption objects to the database.
     * @param appTermId The id of the parent AppTerm.
     * @param items The array of IAppTermListOption objects.
     * @param [transaction] The optional transaction context to run the query in.
     * @returns The array of AppTermListOption objects just written to the database.
     */
    public async newRecords(
        appTermId: number,
        items: Array<IAppTermListOption>,
        transaction?: any
    ): Promise<Array<IAppTermListOption>> {
        try {
            const listOptionArray = new Array<IAppTermListOption>();
            const promises = new Array<Promise<IAppTermListOption>>();
            // save the list options if they're there
            if (Array.isArray(items) && items.length) {
                for (let option of items) {
                    promises.push(
                        this.newRecord(appTermId, option, transaction)
                        .then((newOption: IAppTermListOption) => {
                            listOptionArray.push(newOption);
                            return newOption;
                        }, (error: any) => {
                            logger.error('Error creation list option');
                            if (error && error.code === "23505") {
                                throw new BedesError(
                                    'Duplicate list option',
                                    HttpStatusCodes.BadRequest_400,
                                    'Duplicate list option.'
                                );
                            }
                            else {
                                throw error;
                            }
                        })
                    );
                }
                // wait for the list option queries to finish
                await Promise.all(promises);;
            }
            return listOptionArray;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecords`);
            console.log(items);
            logger.error(util.inspect(error));
            throw error;
        }

    }
    /**
     * Insert a new AppTermListOption record.
     * @param appTermId The id of the AppTerm the listOption is linked to.
     * @param item The IAppTermListOption object to save.
     * @returns The new IAppTermListOption that was just created.
     */
    public async newRecord(appTermId: number, item: IAppTermListOption, transaction?: any): Promise<IAppTermListOption> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _appTermId: appTermId,
                _name: item._name,
                _description: item._description || null,
                _unitId: item._unitId || null,
                _uuid: item._uuid
            };
            const ctx = transaction || db;
            const newItem: IAppTermListOption = await ctx.one(this.sqlInsert, params);
            if (item._mapping) {
                bedesQuery.mappedTerm.newTermMappingListOption(appTermId, item._uuid, item._mapping, transaction)
            }
            return newItem;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            console.log(item);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Update an existing AppTermListOption record.
     */
    public updateRecord(item: IAppTermListOption, transaction?: any): Promise<IAppTermListOption> {
        try {
            if (!item._id || !item._name) {
                logger.error(`${this.constructor.name}: updateRecord expects an id and name`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _id: item._id,
                _name: item._name.trim() || null,
                _unitId: item._unitId || null
            };
            if (transaction) {
                return transaction.one(this.sqlUpdate, params);
            }
            else {
                return db.one(this.sqlUpdate, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Remove a AppTermListOption record.
     */
    public deleteRecord(id: number, transaction?: any): Promise<number> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _id: id
            };
            const dbContext = transaction ? transaction : db;
            return dbContext.result(this.sqlDelete, params, (a: any) => a.rowCount)
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Removes all AppTermListOption records linked to an AppTerm.
     *
     * @param termTypeId The id of the AppTerm for which all of the listOptions are being removed.
     * @param [transaction] Optional database transaction context.
     * @returns The number of records deleted.
     */
    public deleteByTermTypeId(termTypeId: number, transaction?: any): Promise<number> {
        try {
            if (!termTypeId) {
                logger.error(`${this.constructor.name}: Missing termTypeId`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _appTermId: termTypeId
            };
            // set the db context
            const dbContext = transaction ? transaction : db;
            return dbContext.result(this.sqlDeleteByAppTermId, params, (a: any) => a.rowCount)
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
