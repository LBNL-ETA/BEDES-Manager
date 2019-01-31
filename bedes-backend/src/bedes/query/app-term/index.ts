import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import {
    IAppTerm,
    IAppTermAdditionalInfo,
    IAppTermList,
    IAppTermListOption
} from '@bedes-common/models/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { bedesQuery } from '..';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';

export class AppTermQuery {
    private sqlInsertTerm: QueryFile;
    private sqlUpdateTerm: QueryFile;
    private sqlInsertAdditionalData: QueryFile;
    private sqlGetAppTermsByAppId: QueryFile;
    private sqlGetAppTermById: QueryFile;
    private sqlGetAppTermBySibling: QueryFile;
    private sqlDeleteAppTermById: QueryFile;
    private sqlDeleteAppTermByUUID: QueryFile;

    constructor() { 
        // load the queries
        this.sqlInsertTerm = sql_loader(path.join(__dirname, 'insert-app-term.sql'))
        this.sqlUpdateTerm = sql_loader(path.join(__dirname, 'update-app-term.sql'))
        this.sqlInsertAdditionalData = sql_loader(path.join(__dirname, 'insert-additional-data.sql'))
        this.sqlGetAppTermsByAppId = sql_loader(path.join(__dirname, 'get-app-terms.sql'))
        this.sqlGetAppTermById = sql_loader(path.join(__dirname, 'get-app-term.sql'))
        this.sqlGetAppTermBySibling = sql_loader(path.join(__dirname, 'get-app-terms-by-sibling.sql'))
        this.sqlDeleteAppTermById = sql_loader(path.join(__dirname, 'delete-app-term-by-id.sql'))
        this.sqlDeleteAppTermByUUID = sql_loader(path.join(__dirname, 'delete-app-term-by-uuid.sql'))
    }


    /**
     * Saves a new AppTerm record to the database.
     * 
     * TODO: this needs to be refactored, too much going on here
     */
    public async newAppTerm(appId: number, item: IAppTerm | IAppTermList, transaction?: any): Promise<IAppTerm | IAppTermList> {
        try {
            // make sure this is part of a db transaction
            // create one if not and call again
            if (!transaction) {
                return db.tx('newAppTerm trans', (trans: any) => {
                    return this.newAppTerm(appId, item, trans);
                })
            }
            // make sure the list option name is present
            if (!item._name || !item._name.trim()) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters'
                );
            }
            // build the query parameters
            const params = {
                _appId: appId,
                _fieldCode: item._fieldCode,
                _name: item._name.trim() || null,
                _description: item._description || null,
                _termTypeId: item._termTypeId,
                _unitId: item._unitId || null,
                _uuid: item._uuid || null
            }
            // insert the record, should get back the new object record saved
            const newAppTerm: IAppTerm | IAppTermList = await transaction.one(this.sqlInsertTerm, params);
            if (!newAppTerm || !newAppTerm._id) {
                throw new Error(`${this.constructor.name}: _id missing from new AppTerm`);
            }
            // create the AdditionalInfo object
            newAppTerm._additionalInfo = new Array<IAppTermAdditionalInfo>();
            // Created a variable for additinalInfo to stop the linter from complaining.
            const additionalInfo = newAppTerm._additionalInfo;
            // write the additional data, if any
            if (Array.isArray(item._additionalInfo) && item._additionalInfo.length) {
                let promises =  new Array<Promise<any>>();
                additionalInfo.forEach((item: IAppTermAdditionalInfo) => {
                    promises.push(
                        // @ts-ignore
                        this.newAppTermAdditionalData(newAppTerm._id, item, transaction)
                        .then((newInfo: IAppTermAdditionalInfo) => {
                            // additionalInfo is the same array of additionalInfo
                            // that's attached to the newAppTerm.  See a few lines above.
                            additionalInfo.push(newInfo);
                            return newInfo;
                        })
                    );
                });
                newAppTerm._additionalInfo = await Promise.all(promises);
            }
            // setup the list options if its a constrained list
            if (newAppTerm._termTypeId === TermType.ConstrainedList) {
                // setup the returned object's list option array
                const appTermList = <IAppTermList>newAppTerm;
                const itemList = <IAppTermList>item;
                appTermList._listOptions = new Array<IAppTermListOption>();
                // save the list options if they're there
                if (
                    Array.isArray(itemList._listOptions)
                    && itemList._listOptions.length
                ) {
                    let promises = new Array<Promise<any>>();
                    for (let option of itemList._listOptions) {
                        promises.push(
                            bedesQuery.appTermListOption.newRecord(newAppTerm._id, option, transaction)
                            .then((newOption: IAppTermListOption) => {
                                // @ts-ignore
                                appTermList._listOptions.push(newOption);
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
                return appTermList;
            }
            else {
                // return an IAppTerm
                return <IAppTerm>newAppTerm;
            }

        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newAppTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Save the AppTerm's additional data.
     */
    public async newAppTermAdditionalData(termId: number, item: IAppTermAdditionalInfo, transaction?: any): Promise<IAppTermAdditionalInfo> {
        try {
            if (!item._appFieldId) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _appTermId: termId,
                _appFieldId: item._appFieldId,
                _value: item._value
            }
            if (transaction) {
                return transaction.one(this.sqlInsertAdditionalData, params);
            }
            else {
                return db.one(this.sqlInsertAdditionalData, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            throw error;
        }

    }

    /**
     * Update an existing AppTerm record.
     */
    public async updateAppTerm(appId: number, item: IAppTerm, transaction?: any): Promise<IAppTerm | IAppTermList> {
        try {
            // Make sure this is wrapped in a transaction context
            if (!transaction) {
                // create the transaction if it doesn't exist
                return db.tx('update AppTerm trans', (newTrans: any) => {
                    // once the transaction is created, call again
                    return this.updateAppTerm(appId, item, newTrans);
                });
            }
            const appTermId = item._id || undefined;
            if (!appTermId) {
                logger.error(`${this.constructor.name}: updateAppTerm expected a valid appTermId, none found`);
                console.log(item);
                throw new Error('Invalid updated on AppTerm object');
            }
            // create the query params for updating the AppTerm record.
            const params = {
                _id: item._id,
                _name: item._name.trim() || null,
                _description: item._description || null,
                _termTypeId: item._termTypeId,
                _unitId: item._unitId || null,
                _uuid: item._uuid || null
            }
            // update the record, should get back the new updated record
            const newAppTerm: IAppTerm | IAppTermList = await transaction.one(this.sqlUpdateTerm, params, transaction);
            if (!newAppTerm || !newAppTerm._id) {
                throw new Error(`${this.constructor.name}: _id missing from new AppTerm`);
            }
            // update the list options
            if (newAppTerm._termTypeId === TermType.Atomic) {
                // AppTerm is a [value] term
                // remove all listOptions in case any exist
                bedesQuery.appTermListOption.deleteByTermTypeId(appTermId, transaction);
                return <IAppTerm>newAppTerm;
            }
            else {
                // new AppTerm is a constrained list
                // save/update app terms
                bedesQuery.appTermListOption.deleteByTermTypeId(appTermId, transaction);
                // get a reference to the AppTerm as an AppTermList
                const itemList = <IAppTermList>item;
                // create the array of list options
                itemList._listOptions = new Array<IAppTermListOption>();
                // get a reference to the new list option array
                const newListOptions = itemList._listOptions;
                // keeps track of the listOption query promises
                const promises = new Array<Promise<IAppTermListOption>>();
                if (itemList._listOptions && Array.isArray(itemList._listOptions)) {
                    // Write the listOptions
                    for (let listOption of itemList._listOptions) {
                        // write the individual listOption
                        promises.push(
                            bedesQuery.appTermListOption.newRecord(appTermId, listOption, transaction)
                            .then((newListOption: IAppTermListOption) => {
                                // add the updated listOption record to the new AppTermList
                                newListOptions.push(newListOption);
                                return newListOption;
                            })
                        );
                    }
                    // wait for list option promises to resolve
                    await Promise.all(promises);
                }
                return <IAppTermList>newAppTerm;
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateAppTerm`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Delete an AppTerm object record by its numeric id.
     *
     * @param id The id of the AppTerm object.
     * @param [transaction] The optional transaction context.
     * @returns The number of records deleted.
     */
    public async deleteAppTermById(id: number, transaction?: any): Promise<number> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: deleteAppTermById expected an id, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.result(this.sqlDeleteAppTermById, params, (r: any) => r.rowCount);
            }
            else {
                return db.result(this.sqlDeleteAppTermById, params, (r: any) => r.rowCount);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteAppTermById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Delete an AppTerm object record by its uuid.
     *
     * @param uuid The uuid of the AppTerm object.
     * @param [transaction] The optional transaction context.
     * @returns The number of records deleted.
     */
    public async deleteAppTermByUUID(uuid: string, transaction?: any): Promise<number> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: deleteAppTermByUUId expected an uuid, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _uuid: uuid
            };
            if (transaction) {
                return transaction.result(this.sqlDeleteAppTermByUUID, params, (r: any) => r.rowCount);
            }
            else {
                return db.result(this.sqlDeleteAppTermByUUID, params, (r: any) => r.rowCount);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteAppTermByUUID`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves an array of AppTerm objects for a given appId
     */
    public async getAppTermsByAppId(appId: number, transaction?: any): Promise<Array<IAppTerm | IAppTermList>> {
        try {
            if (!appId) {
                logger.error(`${this.constructor.name}: Missing appId`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _appId: appId
            }
            if (transaction) {
                return transaction.manyOrNone(this.sqlGetAppTermsByAppId, params);
            }
            else {
                return db.manyOrNone(this.sqlGetAppTermsByAppId, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAlppTermsbyAppId`);
            logger.error(util.inspect(error));
            throw error;
        }

    }

    /**
     * Retrieves a specific AppTerm object by id.
     */
    public async getAppTermById(id: number, transaction?: any): Promise<IAppTerm | IAppTermList | null> {
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
            }
            if (transaction) {
                return transaction.oneOrNone(this.sqlGetAppTermById, params);
            }
            else {
                return db.oneOrNone(this.sqlGetAppTermById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAppTermById`);
            logger.error(util.inspect(error));
            throw error;
        }

    }

    /**
     * Retrieve all AppTerm objects for a given MappingApplication,
     * given an id from one of the AppTerms.
     */
    public async getAppTermBySibling(appTermId: number, transaction?: any): Promise<Array<IAppTerm | IAppTermList>> {
        try {
            if (!appTermId) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters.'
                );
            }
            const params = {
                _appTermId: appTermId
            }
            if (transaction) {
                return transaction.manyOrNone(this.getAppTermBySibling, params);
            }
            else {
                return db.manyOrNone(this.sqlGetAppTermBySibling, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAppTermBySibling`);
            logger.error(util.inspect(error));
            throw error;
        }

    }
}
