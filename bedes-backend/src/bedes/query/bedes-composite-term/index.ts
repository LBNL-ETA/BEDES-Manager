import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesCompositeTerm, ICompositeTermDetail } from '@bedes-common/models/bedes-composite-term';
import { bedesQuery } from '@bedes-backend/bedes/query';
import { IBedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short';
import { ICompositeTermDetailRequestParam } from '@bedes-common/models/composite-term-detail-request-param';
import { ICompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { v4 } from 'uuid';

export class BedesCompositeTermQuery {
    private sqlGetBySignature: QueryFile;
    private sqlGetById: QueryFile;
    private sqlGetByUUID: QueryFile;
    private sqlGetAllTerms: QueryFile;
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlGetCompositeTermComplete: QueryFile;
    private sqlGetCompositeTermCompleteUUID: QueryFile;
    private sqlDelete: QueryFile;

    constructor() { 
        this.sqlGetBySignature = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlGetById = sql_loader(path.join(__dirname, 'get-by-id.sql'));
        this.sqlGetByUUID = sql_loader(path.join(__dirname, 'get-by-uuid.sql'));
        this.sqlGetAllTerms = sql_loader(path.join(__dirname, 'get-all-terms.sql'));
        this.sqlGetCompositeTermComplete = sql_loader(path.join(__dirname, 'get-composite-term-complete.sql'));
        this.sqlGetCompositeTermCompleteUUID = sql_loader(path.join(__dirname, 'get-composite-term-complete-uuid.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'))
    }

    /**
     * Writes a IBedesCompositeTerm object to the db, saving both the
     * master and detail records.
     */
    public async newCompositeTerm(item: IBedesCompositeTerm, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            console.log('newCompositeTerm');
            // create the composite term record
            let newRec: IBedesCompositeTerm | undefined;
            item._uuid = v4();
            try {
                newRec = await this.newRecord(item, transaction);
            }
            catch (error) {
                if (error && error.code === "23505") {
                    throw new BedesError(
                        'Composite term already exists.',
                        HttpStatusCodes.BadRequest_400,
                        'Composite term already exists.'
                    )
                }
                throw error;
            }
            if (!newRec || !newRec._id) {
                throw new Error(`${this.constructor.name}: missing _id returned from newCompositeTerm query`);
            }
            const detailItems = new Array<ICompositeTermDetail>();
            newRec._items = detailItems;
            const promises = new Array<Promise<ICompositeTermDetail>>();
            // save all of the detail items.
            for (let detailItem of item._items) {
                promises.push(bedesQuery.compositeTermDetail.newRecord(newRec._id, detailItem, transaction)
                    .then((newDetailRec: ICompositeTermDetail) => {
                        detailItems.push(newDetailRec);
                        return newDetailRec;
                    }));
            }
            await Promise.all(promises);
            return newRec;

        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newCompositeTerm`);
            logger.error(util.inspect(error));
            logger.error('data = ')
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Writes an IBedesCompositeTerm record to the database.
     *
     */
    public async newRecord(item: IBedesCompositeTerm, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!item._signature) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-newRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _signature: item._signature,
                _name: item._name,
                _description: item._description,
                _unitId: item._unitId,
                _uuid: item._uuid
            };
            // first create the composite term record
            if (transaction) {
                return await transaction.one(this.sqlInsert, params);
            }
            else {
                return await db.one(this.sqlInsert, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            logger.error('data = ')
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Update an existing composite term.
     *
     * @param item The object record to update.
     * @returns The record that was just updated.
     */
    public async updateCompositeTerm(item: IBedesCompositeTerm, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            console.log('update composite term');
            // make sure this runs in a transaction if it isn't
            if (!transaction) {
                return db.tx((newTransaction: any) => {
                    return this.updateCompositeTerm(item, newTransaction);
                });
            }
            // update the composite term record
            let newRec: IBedesCompositeTerm | undefined;
            try {
                newRec = await this.updateRecord(item, transaction);
            }
            catch (error) {
                logger.error('error in updatecompositeTerm');
                console.log(error);
            }
            if (!newRec) {
                throw new Error(`${this.constructor.name}: updateRecord should have returned an object, none received`);
            }
            if (!newRec._id) {
                throw new Error(`${this.constructor.name}: missing _id returned from newCompositeTerm query`);
            }
            // delete the existing detail items
            let numRemoved = await bedesQuery.compositeTermDetail.deleteByCompositeTermId(newRec._id, transaction);
            console.log(`removed ${numRemoved} recs`);
            newRec._items = new Array<ICompositeTermDetail>();
            const promises = new Array<Promise<ICompositeTermDetail>>();
            // save all of the detail items.
            for (let detailItem of item._items) {
                promises.push(bedesQuery.compositeTermDetail.newRecord(newRec._id, detailItem, transaction)
                    .then((newDetailRec: ICompositeTermDetail) => {
                        // @ts-ignore - 
                        newRec._items.push(newDetailRec);
                        return newDetailRec;
                    }));
            }
            await Promise.all(promises);
            return newRec;

        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateCompositeTerm`);
            logger.error(util.inspect(error));
            logger.error('data = ')
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Updates an existing BedesCompositeTermRecord.
     */
    public async updateRecord(item: IBedesCompositeTerm, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!item._signature) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-updateRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: item._id,
                _signature: item._signature,
                _name: item._name,
                _description: item._description,
                _unitId: item._unitId
            };
            console.log('params');
            console.log(params)
            // first create the composite term record
            if (transaction) {
                return await transaction.one(this.sqlUpdate, params);
            }
            else {
                return await db.one(this.sqlUpdate, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateRecord`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Build ICompositeTermDetail objects from the given uuids listed in the queryParams object.
     */
    public async getCompositeTermDetailInfo(
        queryParams: Array<ICompositeTermDetailRequestParam>,
        transaction?: any
    ): Promise<Array<ICompositeTermDetailRequestResult>> {
        try {
            if (!queryParams || !Array.isArray(queryParams)) {
                logger.error(`${this.constructor.name}: buildTermDetails expends an array of queryParams, none found.`);
                throw new Error('Missing required parameters.');
            }
            const results = new Array<ICompositeTermDetailRequestResult>();
            for (let queryParam of queryParams) {
                // fetch a bedes term and list option record, if it
                const newRec: ICompositeTermDetailRequestResult = {
                    term: await bedesQuery.terms.getRecordByUUID(queryParam.termUUID, transaction),
                    listOption: queryParam.listOptionUUID
                        ? await bedesQuery.termListOption.getRecordByUUID(queryParam.listOptionUUID, transaction)
                        : undefined
                };
                results.push(newRec);
            }
            return results;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in buildCompositeTermDetails`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(queryParams));
            throw error;
        }
    }

    /**
     * Searches the database for a matching composite term signature.
     */
    public getRecordBySignature(signature: string, transaction?: any): Promise<IBedesCompositeTerm | null> {
        try {
            if (!signature) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _signature: signature
            };
            if (transaction) {
                return transaction.oneOrNone(this.sqlGetBySignature, params);
            }
            else {
                return db.oneOrNone(this.sqlGetBySignature, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordBySignature`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Searches the database for a matching composite term id.
     */
    public getRecordById(id: number, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.oneOrNone(this.sqlGetById, params);
            }
            else {
                return db.oneOrNone(this.sqlGetById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves an IBedesCompositeTerm record from the database given a uuid.
     *
     * @param uuid The uuid of the composite term record to retrieve.
     * @param [transaction] Optional database transaction context.
     * @returns Promise that resolves to the IBedesCompositeTerm record.
     */
    public getRecordByUUID(uuid: string, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: getRecordByUUID expecs a uuid`);
                throw new BedesError(
                    'Invalid parameters',
                    HttpStatusCodes.BadRequest_400,
                    'Invalid parameters'
                );
            }
            const params = {
                _uuid: uuid
            };
            const ctx = transaction || db;
            return ctx.oneOrNone(this.sqlGetByUUID, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retireves the list of all composite terms in the database.
     * 
     * @returns Returns an array of all the composite terms.
     */
    public getAllTerms( transaction?: any): Promise<Array<IBedesCompositeTermShort>> {
        try {
            if (transaction) {
                return transaction.manyOrNone(this.sqlGetAllTerms);
            }
            else {
                return db.manyOrNone(this.sqlGetAllTerms);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllTerms`);
            logger.error(util.inspect(error));
            throw error;
        }
    }


    /**
     * Retrieves a complete IBedesCpompositeTerm object for the given
     * composite term_id.
     */
    public getRecordComplete(id: number, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.oneOrNone(this.sqlGetCompositeTermComplete, params);
            }
            else {
                return db.oneOrNone(this.sqlGetCompositeTermComplete, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordComplete`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves a complete IBedesCpompositeTerm object for the given uuid.
     */
    public getRecordCompleteByUUID(uuid: string, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _uuid: uuid
            };
            const ctx = transaction || db;
            return ctx.oneOrNone(this.sqlGetCompositeTermCompleteUUID, params);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordComplete`);
            logger.error(util.inspect(error));
            throw error;
        }
    }


    /**
     * Delete a complete composite term.
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
}
