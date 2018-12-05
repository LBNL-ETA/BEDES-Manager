import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { ICompositeTermDetail } from '@bedes-common/models/bedes-composite-term';

export class CompositeTermDetailQuery {
    private sqlGetByName!: QueryFile;
    private sqlInsert!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

    /**
     * Write a new CompositeTermDetail object to the database.
     * 
     * @param item
     * @param [transaction]
     * @returns 
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
                _listOptionId: item._termOption ? item._termOption._id : null,
                _orderNumber: item._orderNumber
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
            throw error;
        }
    }
}
