import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import * as util from 'util';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option';

export class BedesTermListOptionQuery {
    private sqlGetByName!: QueryFile;
    private sqlInsert!: QueryFile;
    private sqlDelete!: QueryFile;
    private sqlUpdate!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlDelete = sql_loader(path.join(__dirname, 'delete.sql'))
        this.sqlUpdate = sql_loader(path.join(__dirname, 'update.sql'))
    }

    /**
     * Writes a new IBedesTermOption to the database,
     * links to BedesTerm._termId.
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

    public updateRecord(item: IBedesTermOption, transaction?: any): Promise<IBedesTermOption> {
        try {
            if (!item._id || !item._name) {
                logger.error(`${this.constructor.name}: invalid parameters`);
                throw new Error('Invalid parameters.');
            }
            const params = {
                _id: item._id,
                _name: item._name,
                _description: item._description,
                _unitId: item._unitId,
                _definitionSourceId: item._definitionSourceId
            };
            logger.debug(`update term option`);
            logger.debug(util.inspect(params));
            if (transaction) {
                return transaction.one(this.sqlUpdate, params);
            }
            else {
                return db.one(this.sqlUpdate, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in updateRecord`);
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

    /**
     * Delete a bedes list option.
     */
    public async deleteRecord(id: number, transaction?: any): Promise<boolean> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new Error('Invalid parameters.');
            }
            // set the query parameters
            const params = {
                _id: id 
            };
            // set the db context
            const dbContext = transaction ? transaction : db;
            // run the query
            const numRows = await dbContext.result(this.sqlDelete, params, (a: any) => a.rowCount)
            return numRows === 1 ? true : false;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordByName`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
