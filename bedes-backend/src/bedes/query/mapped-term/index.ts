import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { AppTerm, IAppTerm, AppTermAdditionalInfo, IAppTermAdditionalInfo } from '@bedes-common/app-term';
import { IMappedTerm, IAppTermMap, IBedesTermMap } from '@bedes-common/mapped-term';

export class MappedTermQuery {
    private sqlInsertTerm!: QueryFile;
    private sqlInsertAppTermMap!: QueryFile;
    private sqlInsertBedesTermMap!: QueryFile;

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
        this.sqlInsertBedesTermMap = sql_loader(path.join(__dirname, 'insert-bedes-term-map.sql'))
    }

    public async newMappedTerm(item: IMappedTerm, transaction?: any): Promise<IMappedTerm> {
        try {
            if (!item || !item._appId || !item._appTerms.length || !item._bedesTerms.length) {
                logger.error(`${this.constructor.name}: invalid paramters`);
                logger.error(util.inspect(item));
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _appId: item._appId
            };
            let mappedTerm: IMappedTerm;
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
            for (let appTerm of item._appTerms) {
                promises.push(this.newAppTermMap(mappedTerm._id, appTerm, transaction));
            }
            for (let bedesTerm of item._bedesTerms) {
                if (!bedesTerm._bedesTermId) {
                    logger.error(`${this.constructor.name}: bedes term missing _id`);
                    logger.error(util.inspect(item));
                    throw new Error('BedesTerm missing id');
                }
                promises.push(this.newBedesTermMap(mappedTerm._id, bedesTerm, transaction));
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

    public async newBedesTermMap(mappedTermId: number, bedesTerm: IBedesTermMap, transaction?: any): Promise<any> {
        try {
            if (!mappedTermId || !bedesTerm || !bedesTerm._bedesTermId) {
                logger.error(`${this.constructor.name}: invalid paramters`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _mappedTermId: mappedTermId,
                _bedesTermId: bedesTerm._bedesTermId,
                _orderNumber: bedesTerm._orderNumber
            };
            if (transaction) {
                return transaction.one(this.sqlInsertBedesTermMap, params);
            }
            else {
                return db.one(this.sqlInsertBedesTermMap, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newAppTermMap (${mappedTermId}, ${bedesTerm._bedesTermId})`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

}
