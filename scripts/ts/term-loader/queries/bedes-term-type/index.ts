import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@app-root/logging';
const logger = createLogger(module);
import { IBedesTermType } from '@bedes-common/bedes-term-type';

class BedesTermTypeQuery {
    private sqlGetByName!: QueryFile;
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
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

    public newRecord(item: IBedesTermType): Promise<any> {
        if (!item._name) {
            logger.error(`${this.constructor.name}: Missing name in BedesTermType-newRecord`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: item._name
        };
        return db.one(this.sqlInsert, params);
    }

    /**
     * Gets BedesTermType record given a unit name.
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string): Promise<any> {
        if (!name) {
            logger.error(`${this.constructor.name}: Missing name in BedesTermType-getRecordByName`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: name
        };
        return db.oneOrNone(this.sqlGetByName, params);
    }

}

export { BedesTermTypeQuery };
