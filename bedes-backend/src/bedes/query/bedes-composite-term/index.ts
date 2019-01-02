import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesCompositeTerm, ICompositeTermDetail } from '@bedes-common/models/bedes-composite-term';
import { bedesQuery } from '@bedes-backend/bedes/query';

export class BedesCompositeTermQuery {
    private sqlGetBySignature!: QueryFile;
    private sqlGetById!: QueryFile;
    private sqlInsert!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetBySignature = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlGetById = sql_loader(path.join(__dirname, 'get-by-id.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

    /**
     * Writes a IBedesCompositeTerm object to the db, saving both the
     * master and detail records.
     */
    public async newCompositeTerm(item: IBedesCompositeTerm, transaction?: any): Promise<IBedesCompositeTerm> {
        try {
            // create the composite term record
            const newRec = await this.newRecord(item, transaction);
            if (!newRec._id) {
                throw new Error(`${this.constructor.name}: missing _id returned from newCompositeTerm query`);
            }
            newRec._items = new Array<ICompositeTermDetail>();
            const promises = new Array<Promise<ICompositeTermDetail>>();
            // save all of the detail items.
            for (let detailItem of item._items) {
                promises.push(bedesQuery.compositeTermDetail.newRecord(newRec._id, detailItem, transaction)
                    .then((newDetailRec: ICompositeTermDetail) => {
                        newRec._items.push(newDetailRec);
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
                _unitId: item._unitId
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
            logger.error(`${this.constructor.name}: Error in getRecordBySignature`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
