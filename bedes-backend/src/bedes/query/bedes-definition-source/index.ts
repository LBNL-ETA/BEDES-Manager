import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IBedesDefinitionSource } from '@bedes-common/models/bedes-definition-source';
import * as util from 'util';

export class BedesDefinitionSourceQuery {
    private sqlGetByName!: QueryFile;
    private sqlInsert!: QueryFile;
    private sqlGetAllRecords!: QueryFile

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlGetAllRecords = sql_loader(path.join(__dirname, 'get-all-records.sql'))
    }

    public newRecord(item: IBedesDefinitionSource, transaction?: any): Promise<IBedesDefinitionSource> {
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
     * Gets BedesDefinitionSource record given a unit name.
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string, transaction?: any): Promise<IBedesDefinitionSource> {
        try {
            if (!name) {
                logger.error(`${this.constructor.name}: Missing unitName in BedesUnit-getRecordByName`);
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

    /**
     * Get the list of all definition source objects
     */
    public getAllRecords(transaction?: any): Promise<Array<IBedesDefinitionSource>> {
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

}
