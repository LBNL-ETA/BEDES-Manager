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
import { IBedesTermSectorLink } from '@bedes-common/models/bedes-term-sector-link/bedes-term-sector-link.interface';

export class BedesTermQuery {
    private sqlGetByName!: QueryFile;
    private sqlGetByUUID!: QueryFile;
    private sqlGetTermById!: QueryFile;
    private sqlGetListById!: QueryFile;
    private sqlGetTermOrListById!: QueryFile;
    private sqlGetTermOrListByUUID!: QueryFile;
    private sqlGetBedesList!: QueryFile;
    private sqlInsert!: QueryFile;
    private sqlIsConstrainedList!: QueryFile;
    private sqlUpdateTerm!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        this.sqlGetTermById = sql_loader(path.join(__dirname, 'get-term-by-id.sql'));
        this.sqlGetListById = sql_loader(path.join(__dirname, 'get-list-by-id.sql'));
        this.sqlGetTermOrListById = sql_loader(path.join(__dirname, 'get-term-or-list-by-id.sql'));
        this.sqlGetTermOrListByUUID = sql_loader(path.join(__dirname, 'get-term-or-list-by-uuid.sql'));
        this.sqlGetByName = sql_loader(path.join(__dirname, 'get-by-name.sql'));
        this.sqlGetByUUID = sql_loader(path.join(__dirname, 'get-by-uuid.sql'));
        this.sqlGetBedesList = sql_loader(path.join(__dirname, 'get-bedes-list.sql'));
        this.sqlInsert = sql_loader(path.join(__dirname, 'insert.sql'))
        this.sqlIsConstrainedList = sql_loader(path.join(__dirname, 'is-constrained-list.sql'))
        this.sqlUpdateTerm = sql_loader(path.join(__dirname, 'update-term.sql'))
    }

    /**
     * Writes a new IBedesTerm to the database.
     */
    public async newRecord(item: IBedesTerm, transaction?: any): Promise<IBedesTerm> {
        try {
            if (!item._name) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            // setup the query for the BedesTerm (sectors stored in a separate table)
            const params = {
                _name: item._name,
                _description: item._description || null,
                _termTypeId: item._termCategoryId,
                _dataTypeId: item._dataTypeId,
                _unitId: item._unitId,
                _definitionSourceId: item._definitionSourceId
            };
            // set the database context
            let dbContext: any;
            if (transaction) {
                dbContext = transaction;
                // promises.push(transaction.one(this.sqlInsert, params));
            }
            else {
                dbContext = db;
                // promises.push(db.one(this.sqlInsert, params));
            }
            const newTerm: IBedesTerm = await dbContext.one(this.sqlInsert, params);
            if (!newTerm._id) {
                throw new Error('New BedesTerm missing id');
            }
            // save the sector info
            const sectors = await bedesQuery.bedesTermSectorLink.insertAll(newTerm._id, item._sectors, transaction);
            sectors.forEach((d) => newTerm._sectors.push(d));
            return newTerm;
            
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
     * @param {id} The id of the term to retrieve.
     * @returns The BedesTerm record as an IBedesTerm interface.
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
     * Get a BedesTerm or BedesConstrainedList by uuid.
     */
    public getTermOrListByUUID(uuid: string, transaction?: any): Promise<IBedesTerm | IBedesConstrainedList> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: Missing uuid`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _uuid: uuid
            };
            if (transaction) {
                return transaction.one(this.sqlGetTermOrListByUUID, params);
            }
            else {
                return db.one(this.sqlGetTermOrListByUUID, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getTermOrListByUUID`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Gets BedesUnit record given a unit name.
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
     * Get a bedes term by UUID.
     */
    public getRecordByUUID(uuid: string, transaction?: any): Promise<IBedesTerm> {
        try {
            if (!uuid) {
                logger.error(`${this.constructor.name}: Missing name`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _uuid: uuid
            };
            if (transaction) {
                return transaction.one(this.sqlGetByUUID, params);
            }
            else {
                return db.one(this.sqlGetByUUID, params);
            }
        } catch (error) {
            if (error.name === 'QueryResultError') {
                throw new BedesErrorTermNotFound(uuid);
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

    /**
     * Determines if a term name is a constrained list or regular bedes term.
     */
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

    /**
     * Update an existing BedesTerm.
     */
    public async updateTerm(item: IBedesTerm, transaction?: any): Promise<IBedesTerm> {
        try {
            if (!item._id || !item._name) {
                logger.error(`${this.constructor.name}: Missing parameters`);
                logger.error(util.inspect(item));
                throw new Error('Invalid parameters.');
            }
            // create the array of promises
            const promises = new Array<Promise<any>>();
            // setup the bedesTerm parameters
            const params = {
                _id: item._id,
                _name: item._name,
                _description: item._description || null,
                _termCategoryId: item._termCategoryId,
                _dataTypeId: item._dataTypeId,
                _unitId: item._unitId,
                _definitionSourceId: item._definitionSourceId || null,
                _uuid: item._uuid || null,
                _url: item._url || null,
            };
            
            const dbContext = transaction ? transaction : db;
            const updatedTerm: IBedesTerm = await dbContext.one(this.sqlUpdateTerm, params);

            if (item._sectors && item._sectors.length) {
                updatedTerm._sectors = await bedesQuery.bedesTermSectorLink.update(item._id, item._sectors, transaction);
            }
            else {
                updatedTerm._sectors = new Array<IBedesTermSectorLink>();
            }
            return updatedTerm;
        } catch (error) {
            logger.error(`${this.constructor.name}: error in updateTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

}
