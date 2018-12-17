import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IMappedTerm, IAppTermMap, IBedesAtomicTermMap } from '@bedes-common/models/mapped-term';
import { IBedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term.interface';
import { IBedesTerm } from '@bedes-common/models/bedes-term/bedes-term.interface';
import { isBedesAtomicTermMap, isBedesCompositeTermMap } from '@bedes-common/models/mapped-term/mapped-term-type-guard';
import { IBedesCompositeTermMap } from '@bedes-common/models/mapped-term/bedes-composite-term-map.interface';

export class MappedTermQuery {
    private sqlInsertTerm!: QueryFile;
    private sqlInsertAppTermMap!: QueryFile;
    private sqlInsertBedesAtomicTermMap!: QueryFile;
    private sqlInsertBedesCompositeTermMap!: QueryFile;

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
        this.sqlInsertTerm = sql_loader(path.join(__dirname, 'insert-mapped-term.sql'))
        this.sqlInsertAppTermMap = sql_loader(path.join(__dirname, 'insert-app-term-map.sql'))
        this.sqlInsertBedesAtomicTermMap = sql_loader(path.join(__dirname, 'insert-bedes-atomic-term-map.sql'))
        this.sqlInsertBedesCompositeTermMap = sql_loader(path.join(__dirname, 'insert-bedes-composite-term-map.sql'))
    }

    public async newMappedTerm(item: IMappedTerm, transaction?: any): Promise<IMappedTerm> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !item._appId || !item._appTerms.length) {
                // verify the app term parameters
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                logger.error(util.inspect(item));
                throw new Error('Missing required parameters.');
            }
            else if (isBedesAtomicTermMap(item._bedesTerm) && !item._bedesTerm._bedesTermId) {
                // verify the bedes atomic term parameters, if applicable
                logger.error(`${this.constructor.name}: invalid Bedes Atomic Term parameters.`);
                logger.error(util.inspect(item));
                throw new Error('Missing required parameters.');
            }
            else if (isBedesCompositeTermMap(item._bedesTerm) && !item._bedesTerm._compositeTermId) {
                // verify the bedes composite term parameters, if applicable
                logger.error(`${this.constructor.name}: invalid Bedes Composite Term parameters.`);
                logger.error(util.inspect(item));
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _appId: item._appId
            };
            let mappedTerm: IMappedTerm;
            // created a new mapped term object
            if (transaction) {
                mappedTerm = await transaction.one(this.sqlInsertTerm, params, transaction);
            }
            else {
                mappedTerm = await db.one(this.sqlInsertTerm, params, transaction);
            }
            if (!mappedTerm._id) {
                throw new Error(`${this.constructor.name}: _id missing from new MappedTerm`);
            }
            logger.debug('Created MappedTerm');
            logger.debug(util.inspect(mappedTerm));
            const promises = new Array<Promise<any>>();
            // save the AppTermMap objects
            for (let appTerm of item._appTerms) {
                promises.push(this.newAppTermMap(mappedTerm._id, appTerm, transaction));
            }
            // save either the atomic term link, or composite term link
            if (isBedesAtomicTermMap(item._bedesTerm)) {
                // atomic bedes term
                promises.push(this.newBedesAtomicTermMap(mappedTerm._id, item._bedesTerm, transaction))
            }
            else if (isBedesCompositeTermMap(item._bedesTerm)) {
                // composite bedes term
                promises.push(this.newBedesCompositeTermMap(mappedTerm._id, item._bedesTerm, transaction))
            }
            let results = await Promise.all(promises);
            logger.debug('mapped app and bedes terms');
            logger.debug(util.inspect(results));
            return mappedTerm;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newMappedTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Saves AppTerm mappings for a single MappedTerm to the database.
     */
    public async newAppTermMap(mappedTermId: number, appTerm: IAppTermMap, transaction?: any): Promise<any> {
        try {
            if (!mappedTermId || !appTerm || !appTerm._appTermId) {
                logger.error(`${this.constructor.name}: invalid paramters`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _mappedTermId: mappedTermId,
                _appTermId: appTerm._appTermId,
                _orderNumber: appTerm._orderNumber
            };
            if (transaction) {
                return transaction.one(this.sqlInsertAppTermMap, params);
            }
            else {
                return db.one(this.sqlInsertAppTermMap, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newAppTermMap (${mappedTermId}, ${appTerm._appTermId})`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    // public async newBedesTermMap(mappedTermId: number, bedesTerm: IBedesTermMap, transaction?: any): Promise<any> {
    //     try {
    //         if (!mappedTermId || !bedesTerm || !bedesTerm._bedesTermId) {
    //             logger.error(`${this.constructor.name}: invalid paramters`);
    //             throw new Error('Missing required parameters.');
    //         }
    //         const params = {
    //             _mappedTermId: mappedTermId,
    //             _bedesTermId: bedesTerm._bedesTermId,
    //             _orderNumber: bedesTerm._orderNumber
    //         };
    //         if (transaction) {
    //             return transaction.one(this.sqlInsertBedesTermMap, params);
    //         }
    //         else {
    //             return db.one(this.sqlInsertBedesTermMap, params);
    //         }
    //     } catch (error) {
    //         logger.error(`${this.constructor.name}: Error in newAppTermMap (${mappedTermId}, ${bedesTerm._bedesTermId})`);
    //         logger.error(util.inspect(error));
    //         throw error;
    //     }
    // }

    /**
     * Insert a new composite term map record, which links application term to composite bedes terms.
     */
    public async newBedesCompositeTermMap(mappedTermId: number, compositeTerm: IBedesCompositeTermMap, transaction?: any): Promise<IBedesCompositeTermMap> {
        try {
            if (!mappedTermId || !compositeTerm || !compositeTerm._compositeTermId) {
                logger.error(`${this.constructor.name}: invalid paramters, both mappedTermId and a IBedesCompositeTermMap with a valid _id are required.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _mappedTermId: mappedTermId,
                _compositeTermId: compositeTerm._compositeTermId
            };
            if (transaction) {
                return transaction.one(this.sqlInsertBedesCompositeTermMap, params);
            }
            else {
                return db.one(this.sqlInsertBedesCompositeTermMap, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newBedesCompositeTermMap (${mappedTermId}, ${compositeTerm})`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    /**
     * Insert a new bedes atomic term into the db, which links an application term to a bedes atomic term.
     */
    public async newBedesAtomicTermMap(mappedTermId: number, termMap: IBedesAtomicTermMap, transaction?: any): Promise<IBedesAtomicTermMap> {
        try {
            if (!mappedTermId || !termMap|| !termMap._bedesTermId) {
                logger.error(`${this.constructor.name}: invalid paramters, both mappedTermId and a BedesAtomicTermMap with a valid _id are required.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _mappedTermId: mappedTermId,
                _bedesTermId: termMap._bedesTermId
            };
            if (transaction) {
                return transaction.one(this.sqlInsertBedesAtomicTermMap, params);
            }
            else {
                return db.one(this.sqlInsertBedesAtomicTermMap, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newBedesAtomicTermMap (${mappedTermId}, ${termMap})`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
