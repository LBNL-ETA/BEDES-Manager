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
import { IMappingApplication } from '@bedes-common/models/mapping-application';

export class AppTermQuery {
    private sqlInsertTerm: QueryFile;
    private sqlInsertAdditionalData: QueryFile;
    private sqlGetAppTermsByAppId: QueryFile;
    private sqlGetAppTermById: QueryFile;
    private sqlGetAppTermBySibling: QueryFile;

    constructor() { 
        // load the queries
        this.sqlInsertTerm = sql_loader(path.join(__dirname, 'insert-app-term.sql'))
        this.sqlInsertAdditionalData = sql_loader(path.join(__dirname, 'insert-additional-data.sql'))
        this.sqlGetAppTermsByAppId = sql_loader(path.join(__dirname, 'get-app-terms.sql'))
        this.sqlGetAppTermById = sql_loader(path.join(__dirname, 'get-app-term.sql'))
        this.sqlGetAppTermBySibling = sql_loader(path.join(__dirname, 'get-app-terms-by-sibling.sql'))
    }


    /**
     * Saves a new AppTerm record to the database.
     */
    public async newAppTerm(appId: number, item: IAppTerm | IAppTermList, transaction?: any): Promise<IAppTerm | IAppTermList> {
        try {
            if (!item._name || !item._name.trim()) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new BedesError(
                    'Missing required parameters.',
                    HttpStatusCodes.BadRequest_400,
                    'Missing required parameters'
                );
            }
            // wrap a set of database calls in a transaction context
            const saveFunction = async (transaction: any): Promise<any> => {
                // build the query parameters
                const params = {
                    _appId: appId,
                    _fieldCode: item._fieldCode,
                    _name: item._name.trim() || null,
                    _description: item._description || null,
                    _termTypeId: item._termTypeId,
                    _unitId: item._unitId || null
                }
                let newAppTerm: IAppTerm | IAppTermList;
                logger.debug('params');
                console.log(params);
                if (transaction) {
                    newAppTerm = await transaction.one(this.sqlInsertTerm, params);
                }
                else {
                    newAppTerm = await db.one(this.sqlInsertTerm, params);
                }
                console.log('results')
                console.log(newAppTerm);
                if (!newAppTerm._id) {
                    throw new Error(`${this.constructor.name}: _id missing from new AppTerm`);
                }
                logger.debug('Created AppTerm');
                logger.debug(util.inspect(newAppTerm));
                newAppTerm._additionalInfo = new Array<IAppTermAdditionalInfo>();
                // write the additional data, if any
                if (Array.isArray(item._additionalInfo) && item._additionalInfo.length) {
                    let promises =  new Array<Promise<any>>();
                    // @ts-ignore
                    item._additionalInfo.forEach(
                        (item: IAppTermAdditionalInfo) => {
                            promises.push(
                                // @ts-ignore
                                this.newAppTermAdditionalData(newAppTerm._id, item, transaction)
                                .then((newInfo: IAppTermAdditionalInfo) => {
                                    newAppTerm._additionalInfo.push(newInfo);
                                    return newInfo;
                                })
                            );
                        });
                    newAppTerm._additionalInfo = await Promise.all(promises);
                    
                    logger.debug(`${this.constructor.name}: successfully wrote additional data`);
                    logger.debug(util.inspect(newAppTerm));
                }
                // setup the list options if its a constrained list
                if (newAppTerm._termTypeId === TermType.ConstrainedList) {
                    // setup the returned object's list option array
                    const appTermList = <IAppTermList>newAppTerm;
                    const itemList = <IAppTermList>item;
                    appTermList._listOptions = new Array<IAppTermListOption>();
                    console.log('save the list options');
                    console.log(itemList);
                    console.log(appTermList);
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
                                    appTermList._listOptions.push(newOption);
                                    return newOption;
                                }, (error: any) => {
                                    logger.error('Error creation list option');
                                    console.log(option);
                                    console.log(error);
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
            }
            logger.debug('wait for transaction to finish...');
            let appTerm: IAppTerm | IAppTermList;
            if (transaction) {
                // use an existing transaction context
                appTerm = await saveFunction(transaction);
            }
            else {
                // otherwise run the set of database calls as a transaction
                appTerm = await db.tx('epb-project-trans', saveFunction);
            }
            logger.debug('done with transaction');
            console.log(appTerm);
            return appTerm; 

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
                return transaction.oneOrNone(this.getAppTermById, params);
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
