import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option';

export class BedesTermListOptionQuery {
    private sqlGetByName!: QueryFile;
    private sqlInsert!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
    }

    /**
     * Writes a new IBedesTermOption to the database,
     * links to BedesTerm._termId.
     * @param termId 
     * @param item 
     * @param [transaction] 
     * @returns record 
     */
    public newRecord(termId: number, item: IBedesTermOption, transaction?: any): Promise<IBedesTermOption> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _termId: termId,
                _name: item._name,
                _description: item._description,
                _unitId: item._unitId,
                _definitionSourceId: item._definitionSourceId
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
     * @param name 
     * @returns record by name 
     */
    public getRecordByName(name: string, transaction?: any): Promise<IBedesTermOption> {
        try {
            if (!name) {
                logger.error(`${this.constructor.name}: Missing name`);
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
