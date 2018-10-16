import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '../../../../bedes-backend/src/db';
import sql_loader from '../../../../bedes-backend/src/db/sql_loader';
import { createLogger }  from '../../logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesUnit } from '../../../../bedes-common/bedes-unit';
import { IBedesTerm, BedesTerm } from '../../../../bedes-common/bedes-term';

export class BedesTermQuery {
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

    public newRecord(item: BedesTerm): Promise<IBedesTerm> {
        if (!item.name) {
            logger.error(`${this.constructor.name}: Missing name`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _name: item.name,
            _termTypeId: item.termTypeId,
            _dataTypeId: item.dataTypeId,
            _unitId: item.unitId
        };
        return db.one(this.sqlInsert, params);
    }

    /**
     * Gets BedesUnit record given a unit name.
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string): Promise<IBedesTerm> {
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
