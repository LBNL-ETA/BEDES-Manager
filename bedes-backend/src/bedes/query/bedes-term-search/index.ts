import * as util from 'util';
import { QueryFile } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IBedesTerm, BedesTerm, IBedesConstrainedList } from '@bedes-common/models/bedes-term';
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
            const [query, params] = this.buildConstrainedListSearchQuery(searchStrings);
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
            bedesNameConditions.push(`bt.description ~* \${${key}}`);
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
                bt.description as "_description",
                bt.term_category_id as "_termCategoryId",
                bt.data_type_id as "_dataTypeId",
                bt.definition_source_id as "_definitionSourceId",
                bt.unit_id as "_unitId",
                bt.uuid as "_uuid",
                bt.url as "_url",
                json_agg(o) as "_options"
            from
                public.bedes_term as bt
            join
                options o on o.term_id = bt.id
            group by
                bt.id, bt.name, bt.description, bt.term_category_id, bt.data_type_id,
                bt.definition_source_id, bt.unit_id, bt.uuid, bt.url
            ;
        `
        logger.debug(query);
        return [query, queryParams];
    }

    private buildSearchQuery(searchTerms: Array<string>): [string, any] {
        let searchNumber = 1;
        let sqlSearchList = new Array<string>();
        const queryParams:any = {};
        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            sqlSearchList.push(`(bt.name ~* \${${key}} or bt.description  ~* \${${key}})`);
            queryParams[key] = searchTerm;
        }
        const query = `
            select
                id as "_id",
                name as "_name",
                description as "_description",
                term_category_id as "_termCategoryId",
                data_type_id as "_dataTypeId",
                definition_source_id as "_definitionSourceId",
                unit_id as "_unitId",
                bt.uuid as "_uuid",
                bt.url as "_url",
                s.sectors as "_sectors"
            from
                public.bedes_term as bt
            left outer join
                (
                    select
                        term_id,
                        json_agg(json_build_object(
                            '_id', id,
                            '_sectorId', sector_id
                        )) as sectors
                    from
                        bedes_term_sector_link s
                    group by
                        term_id
                ) as s on s.term_id = bt.id
            where
                bt.data_type_id != 1
            and
                ${sqlSearchList.join(' and ')}
            ;
        `
        return [query, queryParams];
    }

}
