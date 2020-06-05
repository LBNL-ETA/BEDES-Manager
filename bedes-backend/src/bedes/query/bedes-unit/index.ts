import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesUnit } from '@bedes-common/models/bedes-unit';
import { IUsageCount } from '@bedes-common/interfaces/usage-count.interface';

export class BedesUnitQuery {
    private sqlGetByName!: QueryFile;
    private sqlGetById!: QueryFile;
    private sqlInsert!: QueryFile;
    private sqlGetAllRecords!: QueryFile;
    private sqlUsageCount!: QueryFile

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlGetById = sql_loader(path.join(__dirname, 'get-by-id.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlGetAllRecords = sql_loader(path.join(__dirname, 'get-all-records.sql'))
        this.sqlUsageCount = sql_loader(path.join(__dirname, 'get-usage-count.sql'))
    }

    /**
     * Create a new BedesUnit record.
     */
    public newRecord(item: IBedesUnit, transaction?: any): Promise<IBedesUnit> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-newRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: item._name
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
     * Gets BedesUnit record given a unit name.
     * @param unitName 
     * @returns record by name 
     */
    public getRecordByName(unitName: string, transaction?: any): Promise<IBedesUnit> {
        try {
            if (!unitName) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: unitName
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

    /**
     * Gets BedesUnit record given a unit ID.
     * @param unitId
     * @returns record by ID
     */
    public getRecordById(unitId: number, transaction?: any): Promise<IBedesUnit> {
        try {
            if (unitId == null) {
                logger.error(`${this.constructor.name}: Missing unitId in BedesUnit-getRecordById`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: unitId
            };
            if (transaction) {
                return transaction.one(this.sqlGetById, params);
            }
            else {
                return db.one(this.sqlGetById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Get the list of all Bedes units.
     * @param [transaction] 
     * @returns all records 
     */
    public getAllRecords(transaction?: any): Promise<Array<IBedesUnit>> {
        try {
            if (transaction) {
                return transaction.many(this.sqlGetAllRecords);
            }
            else {
                return db.many(this.sqlGetAllRecords);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getAllRecords`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Calculates how many times a unit is referenced by BedesTerm
     * or BedesTermListOption.
     */
    public getUsageCount(unitId: number, transaction?: any): Promise<IUsageCount> {
        try {
            if (!unitId) {
                logger.error(`${this.constructor.name}: missing unitId`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _unitId: unitId
            };
            if (transaction) {
                return transaction.one(this.sqlUsageCount, params);
            }
            else {
                return db.one(this.sqlUsageCount, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getUsageCount`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
