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
import { ITermMappingAtomic } from '../../../../../bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { ITermMappingComposite } from '../../../../../bedes-common/models/term-mapping/term-mapping-composite.interface';
import { ITermMappingListOption } from '@bedes-common/models/term-mapping/term-mapping-list-option.interface';
import { AppTermListOption } from '../../../../../bedes-common/models/app-term/app-term-list-option';
import { IAppTermListOption } from '../../../../../bedes-common/models/app-term/app-term-list-option.interface';

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

    public async newTermMappingAtomic(appTermId: number, item: ITermMappingAtomic, transaction?: any): Promise<ITermMappingAtomic> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !appTermId) {
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _bedesTermId: item._bedesTerm ? item._bedesTerm._id : null,
                _bedesListOptionId: item._bedesListOption ? item._bedesListOption._id : null,
                _appTermId: appTermId,
                _appListOptionId: item._appListOption ? item._appListOption._id : null
            };
            const ctx = transaction ? transaction : db;
            return ctx.one(this.sqlInsertAtomic, params, transaction);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newMappedTerm`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    public async newTermMappingComposite(appTermId: number, item: ITermMappingComposite, transaction?: any): Promise<ITermMappingComposite> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !appTermId) {
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _bedesCompositeTermId: item._compositeTerm ? item._compositeTerm._id : null,
                _appTermId: appTermId,
                _appListOptionId: item._appListOption ? item._appListOption._id : null
            };
            console.log('new term mapping composite');
            console.log(params);
            const ctx = transaction ? transaction : db;
            return ctx.one(this.sqlInsertComposite, params, transaction);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in newTermMappingComposite`);
            logger.error(util.inspect(error));
            logger.error(util.inspect(item));
            throw error;
        }
    }

    public async newTermMappingListOption(appTermId: number, listOption: IAppTermListOption, item: ITermMappingListOption, transaction?: any): Promise<ITermMappingListOption> {
        try {
            // verify the newMappedTerm parameters
            if (!item || !appTermId) {
                logger.error(`${this.constructor.name}: invalid app term parameters.`);
                throw new Error('Missing required parameters.');
            }
            // build the query parameters
            const params = {
                _bedesListOptionId: item._listOption ? item._listOption._id : null,
                _appTermId: appTermId,
                _appListOptionId: listOption._id
            };
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
