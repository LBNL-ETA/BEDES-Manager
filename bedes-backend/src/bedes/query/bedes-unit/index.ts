import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesUnit } from '@bedes-common/models/bedes-unit';

export class BedesUnitQuery {
    private sqlGetByName!: QueryFile;
    private sqlInsert!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

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

}
