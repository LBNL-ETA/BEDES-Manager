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
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { ITermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite.interface';
import { ITermMappingListOption } from '@bedes-common/models/term-mapping/term-mapping-list-option.interface';
import { AppTermListOption } from '@bedes-common/models/app-term/app-term-list-option';
import { IAppTermListOption } from '@bedes-common/models/app-term/app-term-list-option.interface';
import { bedesQuery } from '..';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option.interface';
import { BedesError } from '@bedes-common/bedes-error/bedes-error';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { IAtomicTermMapRecord } from './atomic_term_map_record.interface';
import { ICompositeTermMapRecord } from './composite_term_map_record.interface';
import { isITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic-guard';
import { isITermMappingComposite } from '../../../../../bedes-common/models/term-mapping/term-mapping-composite-guard';

export class MappedTermQuery {
    private sqlInsertAtomic!: QueryFile;
    private sqlInsertComposite!: QueryFile;
    private sqlInsertListOption!: QueryFile;
    // private sqlInsertAppTermMap!: QueryFile;
    // private sqlInsertBedesAtomicTermMap!: QueryFile;
    // private sqlInsertBedesCompositeTermMap!: QueryFile;
    private sqlDeleteAtomicByAppTerm!: QueryFile;
    private sqlDeleteCompositeByAppTerm!: QueryFile;

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
        this.sqlInsertAtomic = sql_loader(path.join(__dirname, 'insert-bedes-atomic-term-map.sql'))
        this.sqlInsertComposite = sql_loader(path.join(__dirname, 'insert-bedes-composite-term-map.sql'))
        this.sqlInsertListOption = sql_loader(path.join(__dirname, 'insert-bedes-list-option-map.sql'))
        // this.sqlInsertAppTermMap = sql_loader(path.join(__dirname, 'insert-app-term-map.sql'))
        // this.sqlInsertBedesAtomicTermMap = sql_loader(path.join(__dirname, 'insert-bedes-atomic-term-map.sql'))
        // this.sqlInsertBedesCompositeTermMap = sql_loader(path.join(__dirname, 'insert-bedes-composite-term-map.sql'))
        this.sqlDeleteAtomicByAppTerm = sql_loader(path.join(__dirname, 'delete-atomic-term-map.sql'))
        this.sqlDeleteCompositeByAppTerm = sql_loader(path.join(__dirname, 'delete-composite-term-map.sql'))
    }

    /**
     * Saves a TermMappingAtomic object record to the database.
     * @param appTermId The database id of the parent AppTerm.
     * @param mapping 
     * @param [transaction] 
     * @returns mapping record 
     */
    public async newMappingRecord(
        appTermId: number,
        mapping: ITermMappingAtomic | ITermMappingComposite,
        transaction?: any
    ): Promise<ITermMappingAtomic | ITermMappingComposite> {
        try {
            if (isITermMappingAtomic(mapping)) {
                return this.newTermMappingAtomic(appTermId, mapping, transaction);
                
            }
            else if (isITermMappingComposite(mapping)) {
                return this.newTermMappingComposite(appTermId, mapping, transaction);
            }
            else {
                logger.error('encountered invalid mapping');
                throw new BedesError(
                    'Invalid mapping',
                    HttpStatusCodes.BadRequest_400,
                    'Invalid mapping'
                )
            }
        }
        catch (error) {
            logger.error(`${this.constructor.name}: Error in newMappingRecord`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(mapping));
            throw error;
        }
    }

    /**
     * Saves a new TermMappingAtomic record in the database.
     * @param appTermId The parent appTerm this mapping describes
     * @param item The object being written to the database.
     * @param [transaction] Optional transaction context to run the query in.
     * @returns The new record object just written.
     */
    public async newTermMappingAtomic(appTermId: number, item: ITermMappingAtomic, transaction?: any): Promise<ITermMappingAtomic> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !appTermId) {
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _bedesTermUUID: item._bedesTermUUID,
                _bedesListOptionUUID: item._bedesListOptionUUID,
                _appTermId: appTermId,
                _appListOptionUUID: item._appListOptionUUID
            };
            const ctx = transaction || db;
            const result: ITermMappingAtomic = await ctx.one(this.sqlInsertAtomic, params, transaction);
            result._bedesName = item._bedesName;
            return result;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newMappedTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Saves a new TermMappingComposite record in the database.
     * @param appTermId The parent appTerm the mapping describes.
     * @param item The object being written to the database.
     * @param [transaction] Optional transaction context to run the query in.
     * @returns The new record object just written.
     */
    public async newTermMappingComposite(appTermId: number, item: ITermMappingComposite, transaction?: any): Promise<ITermMappingComposite> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !appTermId) {
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                throw new Error('Missing required parameters.');
            }
            // find the composite term from it's uuid
            // const compositeTerm = item._compositeTermUUID
            //     ? await bedesQuery.compositeTerm.getRecordByUUID(item._compositeTermUUID)
            //     : undefined;
            // // make sure the object was found
            // if (!compositeTerm || !compositeTerm._id) {
            //     logger.error(`${this.constructor.name}: newTermMappingComposite `)
            //     throw new BedesError(
            //         'An error occurred searching for the composite term.',
            //         HttpStatusCodes.ServerError_500,
            //         'An error occurred searching for the composite term.'
            //     )
            // }
            // build the query parameters
            const params = {
                _bedesCompositeTermUUID: item._compositeTermUUID,
                _appTermId: appTermId,
                _appListOptionUUID: item._appListOptionUUID
            };
            const ctx = transaction || db;
            // return ctx.one(this.sqlInsertComposite, params, transaction);
            const result: ITermMappingComposite = await ctx.one(this.sqlInsertComposite, params, transaction);
            result._bedesName = item._bedesName;
            return result;
            // return ctx.one(this.sqlInsertComposite, params, transaction);
            // wait for the query to finish
            // using the uuid's and not the id's in the mapping objects,
            // so use the query result to create a new object with uuids.
            // const result: ICompositeTermMapRecord = await ctx.one(this.sqlInsertComposite, params, transaction);
            // return <ITermMappingComposite>{
            //     _id: result._id,
            //     _appListOption: item._appListOption,
            //     _compositeTermUUID: item._compositeTermUUID,
            //     _bedesName: item._bedesName
            // }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newTermMappingComposite`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    /**
     * Saves a new TermMappingListOption object to the database.
     * @param appTermId The id of the parent AppTerm.
     * @param listOption The appTerm's listOption being mapped.
     * @param item The object defining the bedes terms being mapped to.
     * @param [transaction] Optional transaction context to run the query in.
     * @returns The new ITermMappingListOption object record written to the database.
     */
    public async newTermMappingListOption(
        appTermId: number,
        listOption: IAppTermListOption,
        item: ITermMappingListOption,
        transaction?: any
    ): Promise<ITermMappingListOption> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !appTermId || !item || !item._bedesTermOptionUUID) {
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                throw new Error('Missing required parameters.');
            }
            const bedesListOption = await bedesQuery.termListOption.getRecordByUUID(item._bedesTermOptionUUID);
            if (!bedesListOption || !bedesListOption._id) {
                logger.error(`${this.constructor.name}: newTermMappingListOption couldn't the matching BedesTermListOption.`);
                throw new BedesError(
                    'An error occurred searching for the bedes list option.',
                    HttpStatusCodes.ServerError_500,
                    'An error occurred searching for the bedes list option.'
                )
            }
            // build the query parameters
            const params = {
                _bedesListOptionId: bedesListOption._id,
                _appTermId: appTermId,
                _appListOptionId: listOption._id
            };
            // get the db context to run the query
            const ctx = transaction ? transaction : db;
            return ctx.one(this.sqlInsertListOption, params, transaction);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newTermMappingListOption`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    public deleteMappingsByAppTerm(appTermId: number, transaction?: any): Array<Promise<any>> {
        try {
            if (!appTermId) {
                logger.error(`${this.constructor.name}: deleteMappingByAppTerm expected an id, none found.`);
                throw new Error('Missing required parameters.');
            }
            const params = {
                _appTermId: appTermId
            };
            const promises = new Array<Promise<any>>();
            if (transaction) {
                promises.push(transaction.result(this.sqlDeleteAtomicByAppTerm, params, (r: any) => r.rowCount));
                promises.push(transaction.result(this.sqlDeleteCompositeByAppTerm, params, (r: any) => r.rowCount));
            }
            else {
                promises.push(db.result(this.sqlDeleteAtomicByAppTerm, params, (r: any) => r.rowCount));
                promises.push(db.result(this.sqlDeleteCompositeByAppTerm, params, (r: any) => r.rowCount));
            }
            return promises;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in deleteAppTermById`);
            logger.error(util.inspect(error));
            throw error;
        }
    }
}
