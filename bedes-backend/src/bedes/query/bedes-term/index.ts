import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IBedesTerm, BedesTerm, IBedesConstrainedList } from '@bedes-common/models/bedes-term';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option';
import { bedesQuery } from '../';
import { BedesErrorTermNotFound } from '../../../../../scripts/ts/mappings-loader/mappings/lib/errors/bedes-term-not-found.error';

export class BedesTermQuery {
    private sqlGetByName!: QueryFile;
    private sqlGetTermById!: QueryFile;
    private sqlGetListById!: QueryFile;
    private sqlGetTermOrListById!: QueryFile;
    private sqlGetBedesList!: QueryFile;
    private sqlInsert!: QueryFile;
    private sqlIsConstrainedList!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetTermById = sql_loader(path.join(__dirname, 'get-term-by-id.sql'));
        this.sqlGetListById = sql_loader(path.join(__dirname, 'get-list-by-id.sql'));
        this.sqlGetTermOrListById = sql_loader(path.join(__dirname, 'get-term-or-list-by-id.sql'));
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlGetBedesList = sql_loader(path.join(__dirname, 'get-bedes-list.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlIsConstrainedList = sql_loader(path.join(__dirname, 'is-constrained-list.sql'))
    }

    /**
     * Writes a new IBedesTerm to the database.
     * @param item 
     * @param [transaction] 
     * @returns record 
     */
    public newRecord(item: IBedesTerm, transaction?: any): Promise<IBedesTerm> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: item._name,
                _description: item._description || null,
                _termTypeId: item._termCategoryId,
                _dataTypeId: item._dataTypeId,
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
     * Writes a new BedesTermConstrainedList, along with its options, to the database.
     * @param item 
     * @param [transaction] 
     * @returns constrained list 
     */
    public async newConstrainedList(item: IBedesConstrainedList, transaction?: any): Promise<IBedesConstrainedList> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _name: item._name,
                _description: item._description || null,
                _termTypeId: item._termCategoryId,
                _dataTypeId: item._dataTypeId,
                _unitId: item._unitId,
                _definitionSourceId: item._definitionSourceId
            };
            // create the constrained list, wait for promise to resolve
            let constrainedList: IBedesConstrainedList;
            if (transaction) {
                constrainedList = await transaction.one(this.sqlInsert, params);
            }
            else {
                constrainedList = await db.one(this.sqlInsert, params);
            }
            if (!constrainedList._id) {
                logger.error(`Expected an _id for a new BedesConstrainedList.`);
                logger.error(util.inspect(item));
                logger.error(util.inspect(constrainedList));
                throw new Error(`${this.constructor.name}: Missing _id on new BedesConstrainedList`);
            }
            const termId: number = constrainedList._id;

            let promises = new Array<Promise<IBedesTermOption>>();
            item._options.map((d) => promises.push(bedesQuery.termListOption.newRecord(termId, d)));
            constrainedList._options = await Promise.all(promises);
            return constrainedList;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieve a BedesTerm by id.
     * @param id 
     * @param [transaction] 
     * @returns record by id 
     */
    public getTermById(id: number, transaction?: any): Promise<IBedesTerm> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.one(this.sqlGetTermById, params);
            }
            else {
                return db.one(this.sqlGetTermById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getRecordById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves a BedesConstrainedList from the database.
     * @param id 
     * @param [transaction] 
     * @returns list by id 
     */
    public getListById(id: number, transaction?: any): Promise<IBedesConstrainedList> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.one(this.sqlGetListById, params);
            }
            else {
                return db.one(this.sqlGetListById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getListById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Retrieves a IBedesTerm or IBedesConstrainedList object,
     * given an id
     * @param id 
     * @param [transaction] 
     * @returns term or list by id 
     */
    public getTermOrListById(id: number, transaction?: any): Promise<IBedesTerm | IBedesConstrainedList> {
        try {
            if (!id) {
                logger.error(`${this.constructor.name}: Missing id`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _id: id
            };
            if (transaction) {
                return transaction.one(this.sqlGetTermOrListById, params);
            }
            else {
                return db.one(this.sqlGetTermOrListById, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getTermOrListById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Gets BedesUnit record given a unit name.
     * @param name 
     * @returns record by name or undefined if it diesn't exist.
     */
    public getRecordByName(name: string, transaction?: any): Promise<IBedesTerm> {
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
            if (error.name === 'QueryResultError') {
                throw new BedesErrorTermNotFound(name);
            }
            else {
                logger.error(`${this.constructor.name}: Error in newRecord`);
                logger.error(util.inspect(error));
                throw error;
            }
        }
    }

    /**
     * Retrieves a IBedesTermConstrainedList from the database.
     * @param listName 
     * @param optionName 
     * @param [transaction] 
     * @returns Promise<IBedesTermConstrainedList | undefined>
     */
    public getConstrainedList(listName: string, optionName: string, transaction?: any): Promise<IBedesConstrainedList> {
        try {
            if (!listName || !optionName) {
                logger.error(`${this.constructor.name}: Missing required paramsters listName and optionName`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _termName: listName,
                _optionName: optionName
            };
            if (transaction) {
                return transaction.one(this.sqlGetBedesList, params);
            }
            else {
                return db.one(this.sqlGetBedesList, params);
            }
        } catch (error) {
            if (error.name === 'QueryResultError') {
                throw new BedesErrorTermNotFound(`listName: ${listName}, optionName: ${optionName}`);
            }
            else {
                logger.error(`${this.constructor.name}: Error in getConstrainedList`);
                logger.error(util.inspect(error));
                throw error;
            }
        }
    }

    public async isConstrainedList(termName: string): Promise<boolean> {
        try {
            if (!termName) {
                logger.error(`${this.constructor.name}: Invalid parameters.`);
                throw new Error('Invalid parameters.');
            }
            const params = {
                _termName: termName
            };
            let result = await db.one(this.sqlIsConstrainedList, params);
            return result._isConstrainedList ? true : false;
        } catch (error) {
            if (error.name === 'QueryResultError') {
                throw new BedesErrorTermNotFound(termName)
            }
            else {
                logger.error(`${this.constructor.name}: Error in isConstrainedList`);
                logger.error(util.inspect(error));
                throw error;
            }
        }
    }

}
