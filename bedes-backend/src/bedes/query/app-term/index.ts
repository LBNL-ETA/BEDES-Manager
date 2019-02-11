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
     * TODO: this needs to be refactored, too much going on here,
     *       split out saving each section into its own methods
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
            // create the AppTerm record
            const newAppTerm: IAppTerm | IAppTermList = await this.newAppTermRecord(appId, item, transaction);
            // make sure there's an object returned with a valid id
            if (!newAppTerm) {
                throw new Error(`${this.constructor.name}: _id missing from new AppTerm`);
            }
            // set a variable for the new appTerm record id.
            const appTermId = newAppTerm._id;
            if (!appTermId) {
                throw new Error('id expected');
            }
            // save the AppTermAdditionalInfo data if present
            if (item._additionalInfo) {
                newAppTerm._additionalInfo = await this.newAppTermAdditionalInfoRecords(appTermId, item._additionalInfo, transaction);
            }

            // save the list options if its a constrained list
            if (newAppTerm._termTypeId === TermType.ConstrainedList) {
                const origAppTermList = <IAppTermList>item;
                const newAppTermList = <IAppTermList>newAppTerm;
                // assign the array of list options
                // if the original list option is present, call query to save the records
                // otherwise do nothing
                if (Array.isArray(origAppTermList._listOptions)) {
                    newAppTermList._listOptions = 
                        await bedesQuery.appTermListOption.newRecords(
                                appTermId,
                                origAppTermList._listOptions,
                                transaction
                            );
                }
                if (item._mapping) {
                    newAppTermList._mapping = await bedesQuery.mappedTerm.newMappingRecord(appTermId, item._mapping, transaction);
                }
                return newAppTermList;
            }
            else {
                if (item._mapping) {
                    newAppTerm._mapping = await bedesQuery.mappedTerm.newMappingRecord(appTermId, item._mapping, transaction);
                }
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
     * Saves the main AppTerm object data stored in public.app_term.
     * @param appId The id of the parent MappingApplication the appTerm belongs to.
     * @param item The AppTerm object to save.
     * @param [transaction] Optional database context for running the query as part of a transaction.
     * @returns The AppTerm record just created.
     */
    public async newAppTermRecord(appId: number, item: IAppTerm, transaction?: any): Promise<IAppTerm> {
        try {
            // make sure the app term name is present
            if (!appId || !item || !item._name.trim()) {
                logger.error(`${this.constructor.name}: newAppTermRecord missing required parameters`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters'
                );
            }
            // write the app term record
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
            // set the database context
            const ctx = transaction || db;
            // insert the record, should get back the new object record saved
            return ctx.one(this.sqlInsertTerm, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newAppTermRecord`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Saves an Array of AppTermAdditionalInfo objects to the database.
     * @param termId The id of the parent AppTerm the items belong to.
     * @param items The Array of AppTermAdditionalInfo objects to save. 
     * @param [transaction] The optional transaction context to run the query in.
     * @returns An array of the new AppTermAdditionalInfo records from the database.
     */
    public async newAppTermAdditionalInfoRecords(
        termId: number,
        items: Array<IAppTermAdditionalInfo>,
        transaction?: any
    ): Promise<Array<IAppTermAdditionalInfo>> {
        try {
            /// create the return array of promises
            const promises =  new Array<Promise<IAppTermAdditionalInfo>>();
            if (Array.isArray(items) && items.length) {
                // save each object, push the promise to the array
                for (let item of items) {
                    promises.push(
                        this.newAppTermAdditionalData(termId, item, transaction)
                    )
                }
            }
            return Promise.all(promises);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newAppTermRecord`);
            logger.error(util.inspect(error));
            console.log(items);
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
    public async updateAppTerm(item: IAppTerm, transaction?: any): Promise<IAppTerm | IAppTermList> {
        try {
            // Make sure this is wrapped in a transaction context
            if (!transaction) {
                // create the transaction if it doesn't exist
                return db.tx('update AppTerm trans', (newTrans: any) => {
                    // once the transaction is created, call again
                    return this.updateAppTerm(item, newTrans);
                });
            }
            const appTermId = item._id;
            // make sure there's an existing record, ie a valid id
            if (!appTermId) {
                throw new Error(`${this.constructor.name}: updateAppTerm expects an AppTerm with a valid id`);
            }
            // update the record, should get back the new updated record
            const newAppTerm = await this.updateAppTermRecord(item, transaction);
            if (!newAppTerm || !newAppTerm._id) {
                throw new Error(`${this.constructor.name}: _id missing from new AppTerm`);
            }
            // update the mappings
            // TODO: update mappings
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
     * Updates an existing AppTerm object record.
     * @param item 
     * @param [transaction] 
     * @returns app term record 
     */
    public async updateAppTermRecord(item: IAppTerm, transaction?: any): Promise<IAppTerm> {
        try {
            // make sure the app term name is present
            if (!item || !item._id || !item._name.trim()) {
                logger.error(`${this.constructor.name}: updateAppTermRecord missing required parameters`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters'
                );
            }
            // write the app term record
            // build the query parameters
            const params = {
                _id: item._id,
                _fieldCode: item._fieldCode,
                _name: item._name.trim() || null,
                _description: item._description || null,
                _termTypeId: item._termTypeId,
                _unitId: item._unitId || null
            }
            // set the database context
            const ctx = transaction || db;
            // insert the record, should get back the new object record saved
            return ctx.one(this.sqlUpdateTerm, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateAppTermRecord`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
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
     * Retrieves an array of all AppTerm objects for a given appId.
     * @param appId The id of the AppTerms MappingApplication.
     * @param [transaction] Optional transaction context to run the query.
     * @returns Array of AppTerm|AppTermLilst objects for the MappingApplication.
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
            // set the db context for the query
            const ctx = transaction ? transaction : db;
            // run the query
            return ctx.manyOrNone(this.sqlGetAppTermsByAppId, params);
            // these are going to be missing the mappings, join them in
            // const appTerms: Array<IAppTerm | IAppTermList> = ctx.manyOrNone(this.sqlGetAppTermsByAppId, params);
            // // hold the mapping query promises
            // const promises = new Array<Promise<ITermMappingAtomic | ITermMappingComposite>>();
            // if (appTerms) {
            //     for(let appTerm of appTerms) {
            //         // promises.push(
            //         //     bedesQuery.mappedTerm.
            //         // )
            //     }
            // }
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
