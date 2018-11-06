import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import * as db from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IBedesTerm, BedesTerm, IBedesConstrainedList } from '@bedes-common/bedes-term';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';

export class BedesTermSearchQuery {
    private sqlSearchBedesConstrainedList!: QueryFile;
    private sqlSearchBedesTerms!: QueryFile;

    constructor() { 
        this.initSql();
    }

    private initSql(): void {
        // this.sqlSearchBedesTerms = sql_loader(path.join(__dirname, 'get-bedes-term-search.sql'));
        // this.sqlSearchBedesConstrainedList = sql_loader(path.join(__dirname, 'get-bedes-constrained-list-search.sql'));
    }

    public async searchAllBedesTerms(searchStrings: Array<string>, transaction?: any): Promise<Array<IBedesTerm | IBedesConstrainedList>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            let promises = new Array<Promise<Array<IBedesTerm | IBedesConstrainedList>>>();
            promises.push(this.searchBedesTerms(searchStrings, transaction))
            promises.push(this.searchConstrainedListTerms(searchStrings, transaction));
            let results = await Promise.all(promises);
            return [...results[0], ...results[1]]
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in searchAllBedesTerms`);
            logger.error(util.inspect(error));
            throw new BedesError(
                error.message,
                HttpStatusCodes.ServerError_500,
                'An error occured querying the database.'
            );
        }
    }

    /**
     * Searches for BedesTerms using the Regex string parameter searchString.
     * @param searchStrings 
     * @param [transaction] 
     * @returns terms 
     */
    public searchBedesTerms(searchStrings: Array<string>, transaction?: any): Promise<Array<IBedesTerm>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            // const params = {
            //     _searchString: searchStrings[0]
            // };
            logger.debug(`search for "${searchStrings}`);
            const [query, params] = this.buildSearchQuery(searchStrings);
            if (transaction) {
                return transaction.manyOrNone(query, params);
            }
            else {
                return db.manyOrNone(query, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in searchTerms`);
            logger.error(util.inspect(error));
            throw new BedesError(
                error.message,
                HttpStatusCodes.ServerError_500,
                'An error occured querying the database.'
            );
        }
    }

    public searchConstrainedListTerms(searchStrings: Array<string>, transaction?: any): Promise<Array<IBedesConstrainedList>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: searchConstrainedListTerms`);
                throw new Error('Missing required parameters.');
            }
            logger.debug(`search for "${searchStrings}`);
            const [query, params] = this.buildConstrainedListSearchQuery(searchStrings);
            logger.debug(`constrined list query`);
            logger.debug(query);
            logger.debug(util.inspect(params));
            if (transaction) {
                return transaction.manyOrNone(query, params);
            }
            else {
                return db.manyOrNone(query, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in searchConstrainedListTerms`);
            logger.error(util.inspect(error));
            throw new BedesError(
                error.message,
                HttpStatusCodes.ServerError_500,
                'An error occured querying the database.'
            );
        }
    }

    private buildConstrainedListSearchQuery(searchTerms: Array<string>): [string, any] {
        let searchNumber = 1;
        let bedesNameConditions = new Array<string>();
        let optionNameConditions = new Array<string>();
        let optionDescConditions = new Array<string>();
        const queryParams:any = {};
        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            bedesNameConditions.push(`bt.name ~* \${${key}}`);
            optionNameConditions.push(`o.name ~* \${${key}}`);
            optionDescConditions.push(`o.description ~* \${${key}}`);
            queryParams[key] = searchTerm;
        }
        const query = `
            with
                option_term_ids as (
                    select
                        term_id, id
                    from
                        bedes_term_list_option as o
                    where
                        (${optionNameConditions.join(' or ')})
                        or
                        (${optionDescConditions.join(' or ')})
                ),
                all_term_ids as (
                    select
                        id
                    from
                        bedes_term bt
                    where
                        (${bedesNameConditions.join(' or ')})
                    and
                        bt.data_type_id = 1
                        
                    union
                    
                    select
                        term_id
                    from
                        option_term_ids
                ),
                options as (
                    -- builds the bedes list term option records
                    select
                        o.id as "_id",
                        o.term_id,
                        o.name as "_name",
                        o.description as "_description",
                        o.unit_id as "_unitId",
                        o.definition_source_id as "_definitionSourceId"
                    from
                        bedes_term_list_option o
                    join
                        all_term_ids i on i.id = o.term_id
                )
            -- build the main output
            select
                bt.id as "_id",
                bt.name as "_name",
                bt.term_type_id as "_termTypeId",
                bt.data_type_id as "_dataTypeId",
                bt.source_id as "_sourceId",
                bt.unit_id as "_unitId",
                json_agg(o) as "_options"
            from
                public.bedes_term as bt
            join
                options o on o.term_id = bt.id
            group by
                bt.id, bt.name, bt.term_type_id, bt.data_type_id, bt.source_id, bt.unit_id
            ;
            ;
        `
        logger.debug('query');
        logger.debug(query);
        logger.debug(util.inspect(queryParams));
        return [query, queryParams];
    }

    private buildSearchQuery(searchTerms: Array<string>): [string, any] {
        let searchNumber = 1;
        let sqlSearchList = new Array<string>();
        const queryParams:any = {};
        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            sqlSearchList.push(`bt.name ~* \${${key}}`);
            queryParams[key] = searchTerm;
        }
        const query = `
            select
                id as "_id",
                name as "_name",
                term_type_id as "_termTypeId",
                data_type_id as "_dataTypeId",
                source_id as "_sourceId",
                unit_id as "_unitId"
            from
                public.bedes_term as bt
            where
                bt.data_type_id != 1
            and
                ${sqlSearchList.join(' and ')}
            ;
        `
        logger.debug('query');
        logger.debug(query);
        logger.debug(util.inspect(queryParams));
        return [query, queryParams];
    }

    /**
     * Search the Bedes Constrained List options.
     * @param searchTerms 
     * @returns search option query 
     */
    private buildSearchOptionQuery(searchTerms: Array<string>): [string, any] {
        let searchNumber = 1;
        let sqlSearchList = new Array<string>();
        const queryParams:any = {};
        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            sqlSearchList.push(`bt.name ~* \${${key}}`);
            queryParams[key] = searchTerm;
        }
        const query = `
            select
                id as "_id",
                name as "_name",
                term_type_id as "_termTypeId",
                data_type_id as "_dataTypeId",
                source_id as "_sourceId",
                unit_id as "_unitId"
            from
                public.bedes_term as bt
            where
                ${sqlSearchList.join(' and ')}
            ;
        `
        logger.debug('query');
        logger.debug(query);
        logger.debug(util.inspect(queryParams));
        return [query, queryParams];
    }
}
