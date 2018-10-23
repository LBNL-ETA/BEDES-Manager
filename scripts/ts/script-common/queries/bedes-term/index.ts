import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@script-common/logging';
const logger = createLogger(module);
import { IBedesTerm, BedesTerm, IBedesTermConstrainedList } from '@bedes-common/bedes-term';
import { BedesDataType } from '@bedes-common/enums/bedes-data-type';

export class BedesTermQuery {
    private sqlGetByName!: QueryFile;
    private sqlGetBedesList!: QueryFile;
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
        this.sqlGetBedesList = sql_loader(path.join(__dirname, 'get-bedes-list.sql'));
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

    public async getConstrainedList(listName: string, optionName: string): Promise<IBedesTermConstrainedList | undefined> {
        if (!listName || !optionName) {
            logger.error(`${this.constructor.name}: Missing required paramsters listName and optionName`);
            throw new Error('Missing required parameters.');
        }
        const params = {
            _termName: listName,
            _optionName: optionName
        };
        return await db.oneOrNone(this.sqlGetBedesList, params);
    }

}
