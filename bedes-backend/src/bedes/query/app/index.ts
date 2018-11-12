import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IApp } from '@bedes-common/models/app';
import * as util from 'util';

export class AppQuery {
    private sqlGet!: QueryFile;
    private sqlInsert!: QueryFile;

    constructor() { 
        this.initSql();
    }

    /**
     * Load the SQL queries.
     *
     * @private
     * @memberof User
     */
    private initSql(): void {
        this.sqlGet = sql_loader(path.join(__dirname, 'get.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

    public newRecord(item: IApp, transaction?: any): Promise<IApp> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name in newRecord`);
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

    public getRecord(name: string, transaction?: any): Promise<IApp> {
        try {
            if (!name) {
                logger.error(`${this.constructor.name}: Missing name in getRecord`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: name
            };
            if (transaction) {
                return transaction.one(this.sqlGet, params);
            }
            else {
                return db.one(this.sqlGet, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
