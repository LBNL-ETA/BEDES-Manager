import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { ICompositeTermDetail } from '@bedes-common/models/bedes-composite-term';

export class CompositeTermDetailQuery {
    private sqlGetByName: QueryFile;
    private sqlInsert: QueryFile;
    private sqlUpdate: QueryFile;
    private sqlDeleteByCompositeTermId: QueryFile;
    private sqlDeleteDetail: QueryFile;

    constructor() { 
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
        this.sqlDeleteByCompositeTermId = sql_loader(path.join(__dirname, 'delete-by-composite-term-id.sql'))
        this.sqlDeleteDetail = sql_loader(path.join(__dirname, 'delete-detail.sql'))
    }

    /**
     * Write a new CompositeTermDetail object to the database.
     */
    public newRecord(compositeTermId: number, item: ICompositeTermDetail, transaction?: any): Promise<ICompositeTermDetail> {
        try {
            if (!item._term) {
                logger.error(`${this.constructor.name}: Missing term in newRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _compositeTermId: compositeTermId,
                _bedesTermId: item._term._id,
                _listOptionId: item._listOption ? item._listOption._id : null,
                _orderNumber: item._orderNumber,
                _isValueField: item._isValueField || false
            };
            if (transaction) {
                return transaction.one(this.sqlInsert, params);
            }
            else {
                return db.one(this.sqlInsert, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Update an existing CompositeTermDetail record.
     */
    public updateRecord(item: ICompositeTermDetail, transaction?: any): Promise<ICompositeTermDetail> {
        try {
            if (!item._term || !item._id) {
                logger.error(`${this.constructor.name}: Missing term in updateRecord`);
                logger.debug(util.inspect(item));
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: item._id,
                _orderNumber: item._orderNumber,
                _isValueField: item._isValueField || false
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
     * Gets BedesCompositeTerm record given by its name.
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string, transaction?: any): Promise<ICompositeTermDetail> {
        try {
            if (!name) {
                logger.error(`${this.constructor.name}: Missing name in getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: name
            };
            if (transaction) {
                return transaction.one(this.sqlGetByName, params);
            }
            else {
                return db.one(this.sqlGetByName, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordByName`);
            logger.error(util.inspect(error));
            console.log('compTermDetailgetRecordByName error: ', error);
            throw error;
        }
    }

    /**
     * Delete all records in the database linked to a given composte term id.
     *
     * @param id The id of the BedesCompositeTerm
     * @param {*} [transaction] Optional database transaction context.
     * @returns A Promise that resolves to the number of records deleted.
     */
    public deleteByCompositeTermId(id: number, transaction?: any): Promise<number> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: deleteByCompositeTermId expected an id, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _compositeTermId: id
            };
            if (transaction) {
                return transaction.result(this.sqlDeleteByCompositeTermId, params, (r: any) => r.rowCount);
            }
            else {
                return db.result(this.sqlDeleteByCompositeTermId, params, (r: any) => r.rowCount);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteByCompositeTermId`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Delete's a CompositeTermDetail record from the database.
     */
    public deleteCompositeTermDetailById(id: number, transaction?: any): Promise<number> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: deleteCompositeTermDetailId expected an id, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.result(this.sqlDeleteDetail, params, (r: any) => r.rowCount);
            }
            else {
                return db.result(this.sqlDeleteDetail, params, (r: any) => r.rowCount);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteCompositeTermDetailId`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
