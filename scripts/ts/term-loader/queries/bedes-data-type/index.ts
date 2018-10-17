import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@app-root/logging';
const logger = createLogger(module);
import { IBedesDataType } from '@bedes-common/bedes-data-type';

export class BedesDataTypeQuery {
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

    public newRecord(item: IBedesDataType): Promise<any> {
        if (!item._name) {
            logger.error(`${this.constructor.name}: Missing dataTypeName in BedesUnit-newRecord`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: item._name
        };
        return db.one(this.sqlInsert, params);
    }

    /**
     * Gets BedesUnit record given a dataType name.
     * @param dataTypeName 
     * @returns record by name 
     */
    public getRecordByName(name: string): Promise<IBedesDataType> {
        if (!name) {
            logger.error(`${this.constructor.name}: Missing name`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: name
        };
        return db.oneOrNone(this.sqlGetByName, params);
    }

}
