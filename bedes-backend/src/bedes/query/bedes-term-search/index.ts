import * as util from 'util';
import { QueryFile, ColumnSet } from 'pg-promise';
import * as path from 'path';
import { db } from '@bedes-backend/db';
import sql_loader from '@bedes-backend/db/sql_loader';
import { createLogger }  from '@bedes-backend/logging';
const logger = createLogger(module);
import { IBedesTerm, BedesTerm, IBedesConstrainedList } from '@bedes-common/models/bedes-term';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { BedesError } from '@bedes-common/bedes-error';
import { IBedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result.interface';
import { ISearchOptions } from '@bedes-common/models/search-options/search-options.interface';

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

    public async searchAllBedesTerms(searchStrings: Array<string>, searchOptions?: ISearchOptions, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            // searchOptions = {
            //     bedesTerm: {
            //         disabled: true,
            //         name: true,
            //         description: true
            //     },
            //     termListOption: {
            //         disabled: true,
            //         name: false,
            //         description: true
            //     },
            //     compositeTerm: {
            //         disabled: false,
            //         name: true,
            //         description:true 
            //     }
            // }
            let promises = new Array<Promise<Array<IBedesSearchResult>>>();
            if (this.shouldSearchBedesTerms(searchOptions)) {
                promises.push(this.searchBedesTerms(searchStrings, searchOptions, transaction))
            }
            if (this.shouldSearchListTermOption(searchOptions)) {
                promises.push(this.searchListTermOption(searchStrings, searchOptions, transaction));
            }
            if (this.shouldSearchCompositeTerms(searchOptions)) {
                promises.push(this.searchCompositeTerms(searchStrings, searchOptions, transaction));
            }
            let results = await Promise.all(promises);
            // transform the results from an array of array of IBedesSearchResult objects,
            // into just an array of IBedesSearchResult objects.
            // ie flatten the resulting array of arrays.
            return results.reduce(
                (returnArray: Array<IBedesSearchResult>, currentResult: Array<IBedesSearchResult>): Array<IBedesSearchResult> => {
                    return returnArray.concat(currentResult);
                },
                new Array<IBedesSearchResult>()
            );
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
     * Determines if the the BedesTerm objects should be searched.
     */
    private shouldSearchBedesTerms(searchOptions?: ISearchOptions): boolean {
        // include searches through termListOption unless it's explicitly disabled
        // ie searchOptions.termListOption.disabled is set,
        // or the name and description are both set to false
        if (searchOptions
            && searchOptions.bedesTerm
            && (
                searchOptions.bedesTerm.disabled
                ||
                (
                    searchOptions.bedesTerm.name === false
                    && searchOptions.bedesTerm.description === false
                )
            )
        ) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Searches for BedesTerms using the Regex string parameter searchString.
     * @param searchStrings 
     * @param [transaction] 
     * @returns terms 
     */
    public searchBedesTerms(searchStrings: Array<string>, searchOptions?: ISearchOptions, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            const [query, params] = this.buildBedesTermQuery(searchStrings, searchOptions);
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

    /**
     * Build the search query for BedesTerm objects.
     */
    private buildBedesTermQuery(searchTerms: Array<string>, searchOptions?: ISearchOptions): [string, any] {
        let searchNumber = 1;
        let sqlSearchList = new Array<string>();
        const queryParams:any = {};
        // extract the search options, if they exist;
        const options = searchOptions && searchOptions.bedesTerm ? searchOptions.bedesTerm : {};
        console.log('bedes term search options', options);
        if (options.disabled || (options.name === false && options.description === false)) {
            logger.error('Invalid query parameters for BedesTerms');
            console.log(searchOptions);
            throw new Error('Invalid query parameters for BedesTerms');
        }

        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            const columns: Array<String> = [];
            if (!searchOptions || options.name) {
                columns.push(`t.name ~* \${${key}}`)
            }
            if (!searchOptions || options.description) {
                columns.push(`t.description ~* \${${key}}`)
            }
            sqlSearchList.push(`(${columns.join(' or ')})`);
            queryParams[key] = searchTerm;
        }
        // const query = `
        //     select
        //         id as "_id",
        //         name as "_name",
        //         description as "_description",
        //         term_category_id as "_termCategoryId",
        //         data_type_id as "_dataTypeId",
        //         definition_source_id as "_definitionSourceId",
        //         unit_id as "_unitId",
        //         bt.uuid as "_uuid",
        //         bt.url as "_url",
        //         s.sectors as "_sectors"
        //     from
        //         public.bedes_term as bt
        //     left outer join
        //         (
        //             select
        //                 term_id,
        //                 json_agg(json_build_object(
        //                     '_id', id,
        //                     '_sectorId', sector_id
        //                 )) as sectors
        //             from
        //                 bedes_term_sector_link s
        //             group by
        //                 term_id
        //         ) as s on s.term_id = bt.id
        //     where
        //         bt.data_type_id != 1
        //     and
        //         ${sqlSearchList.join(' and ')}
        //     ;
        // `
        const query = `
            select
                t.id as "_id",
                t.uuid as "_uuid",
                t.name as "_name",
                t.description as "_description",
                t.data_type_id as "_dataTypeId",
                t.unit_id as "_unitId",
                t.term_category_id as "_termCategoryId",
                case
                    when
                        t.data_type_id != 1
                    then
                        1
                    else
                        2
                end as "_resultObjectType"
            from
                public.bedes_term t
            where
                ${sqlSearchList.join(' and ')}
        `;
        logger.debug(query);
        console.log(queryParams);
        return [query, queryParams];
    }


    // public searchConstrainedListTerms(searchStrings: Array<string>, transaction?: any): Promise<Array<IBedesConstrainedList>> {
    //     try {
    //         if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
    //             logger.error(`${this.constructor.name}: searchConstrainedListTerms`);
    //             throw new Error('Missing required parameters.');
    //         }
    //         const [query, params] = this.buildConstrainedListSearchQuery(searchStrings);
    //         if (transaction) {
    //             return transaction.manyOrNone(query, params);
    //         }
    //         else {
    //             return db.manyOrNone(query, params);
    //         }
    //     } catch (error) {
    //         logger.error(`${this.constructor.name}: Error in searchConstrainedListTerms`);
    //         logger.error(util.inspect(error));
    //         throw new BedesError(
    //             error.message,
    //             HttpStatusCodes.ServerError_500,
    //             'An error occured querying the database.'
    //         );
    //     }
    // }

    /**
     * Determines if the the BedesTerm objects should be searched.
     */
    private shouldSearchListTermOption(searchOptions?: ISearchOptions): boolean {
        // include searches through termListOption unless it's explicitly disabled
        // ie searchOptions.termListOption.disabled is set,
        // or the name and description are both set to false
        if (searchOptions
            && searchOptions.termListOption
            && (
                searchOptions.termListOption.disabled
                ||
                (
                    searchOptions.termListOption.name === false
                    && searchOptions.termListOption.description === false
                )
            )
        ) {
            return false;
        }
        else {
            return true;
        }

    }

    /**
     * Search list term options.
     */
    public searchListTermOption(searchStrings: Array<string>, searchOptions?: ISearchOptions, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: searchListTermOption`);
                throw new Error('Missing required parameters.');
            }
            const [query, params] = this.buildListTermOptionQuery(searchStrings, searchOptions);
            if (transaction) {
                return transaction.manyOrNone(query, params);
            }
            else {
                return db.manyOrNone(query, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in searchListTermOption`);
            logger.error(util.inspect(error));
            throw new BedesError(
                error.message,
                HttpStatusCodes.ServerError_500,
                'An error occured querying the database.'
            );
        }
    }

    private buildListTermOptionQuery(searchTerms: Array<string>, searchOptions?: ISearchOptions): [string, any] {
        let searchNumber = 1;
        let sqlSearchList = new Array<string>();
        const queryParams:any = {};
        // for (let searchTerm of searchTerms) {
        //     const key = `_searchNum${searchNumber++}`;
        //     sqlSearchList.push(`(t.name ~* \${${key}} or t.description  ~* \${${key}})`);
        //     queryParams[key] = searchTerm;
        // }
        // extract the search options, if they exist;
        const options = searchOptions && searchOptions.termListOption ? searchOptions.termListOption : {};
        console.log('term list option search options', options);
        if (options.disabled || (options.name === false && options.description === false)) {
            logger.error('Invalid query parameters for BedesTermOption query');
            console.log(searchOptions);
            throw new Error('Invalid query parameters for BedesTermOption');
        }

        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            const columns: Array<String> = [];
            if (!searchOptions || options.name) {
                columns.push(`t.name ~* \${${key}}`)
            }
            if (!searchOptions || options.description) {
                columns.push(`t.description ~* \${${key}}`)
            }
            sqlSearchList.push(`(${columns.join(' or ')})`);
            queryParams[key] = searchTerm;
        }
        // const query = `
        //     select
        //         id as "_id",
        //         name as "_name",
        //         description as "_description",
        //         term_category_id as "_termCategoryId",
        //         data_type_id as "_dataTypeId",
        //         definition_source_id as "_definitionSourceId",
        //         unit_id as "_unitId",
        //         bt.uuid as "_uuid",
        //         bt.url as "_url",
        //         s.sectors as "_sectors"
        //     from
        //         public.bedes_term as bt
        //     left outer join
        //         (
        //             select
        //                 term_id,
        //                 json_agg(json_build_object(
        //                     '_id', id,
        //                     '_sectorId', sector_id
        //                 )) as sectors
        //             from
        //                 bedes_term_sector_link s
        //             group by
        //                 term_id
        //         ) as s on s.term_id = bt.id
        //     where
        //         bt.data_type_id != 1
        //     and
        //         ${sqlSearchList.join(' and ')}
        //     ;
        // `
        const query = `
            select
                t.id as "_id",
                t.uuid as "_uuid",
                t.name as "_name",
                t.description as "_description",
                t.unit_id as "_unitId",
                3 as "_resultObjectType"
            from
                bedes_term_list_option as t
            where
                ${sqlSearchList.join(' and ')}
        `;
        logger.debug(query);
        console.log(queryParams);
        return [query, queryParams];
    }

    // private buildConstrainedListSearchQuery(searchTerms: Array<string>): [string, any] {
    //     let searchNumber = 1;
    //     let bedesNameConditions = new Array<string>();
    //     let optionNameConditions = new Array<string>();
    //     let optionDescConditions = new Array<string>();
    //     const queryParams:any = {};
    //     for (let searchTerm of searchTerms) {
    //         const key = `_searchNum${searchNumber++}`;
    //         bedesNameConditions.push(`bt.name ~* \${${key}}`);
    //         bedesNameConditions.push(`bt.description ~* \${${key}}`);
    //         optionNameConditions.push(`o.name ~* \${${key}}`);
    //         optionDescConditions.push(`o.description ~* \${${key}}`);
    //         queryParams[key] = searchTerm;
    //     }
    //     const query = `
    //         with
    //             option_term_ids as (
    //                 select
    //                     term_id, id
    //                 from
    //                     bedes_term_list_option as o
    //                 where
    //                     (${optionNameConditions.join(' or ')})
    //                     or
    //                     (${optionDescConditions.join(' or ')})
    //             ),
    //             all_term_ids as (
    //                 select
    //                     id
    //                 from
    //                     bedes_term bt
    //                 where
    //                     (${bedesNameConditions.join(' or ')})
    //                 and
    //                     bt.data_type_id = 1
                        
    //                 union
                    
    //                 select
    //                     term_id
    //                 from
    //                     option_term_ids
    //             ),
    //             options as (
    //                 -- builds the bedes list term option records
    //                 select
    //                     o.id as "_id",
    //                     o.term_id,
    //                     o.name as "_name",
    //                     o.description as "_description",
    //                     o.unit_id as "_unitId",
    //                     o.definition_source_id as "_definitionSourceId",
    //                     o.url as "_url",
    //                     o.uuid as "_uuid"
    //                 from
    //                     bedes_term_list_option o
    //                 join
    //                     all_term_ids i on i.id = o.term_id
    //             )
    //         -- build the main output
    //         select
    //             bt.id as "_id",
    //             bt.name as "_name",
    //             bt.description as "_description",
    //             bt.term_category_id as "_termCategoryId",
    //             bt.data_type_id as "_dataTypeId",
    //             bt.definition_source_id as "_definitionSourceId",
    //             bt.unit_id as "_unitId",
    //             bt.uuid as "_uuid",
    //             bt.url as "_url",
    //             json_agg(o) as "_options"
    //         from
    //             public.bedes_term as bt
    //         join
    //             options o on o.term_id = bt.id
    //         group by
    //             bt.id, bt.name, bt.description, bt.term_category_id, bt.data_type_id,
    //             bt.definition_source_id, bt.unit_id, bt.uuid, bt.url
    //         ;
    //     `;
    //     logger.debug(query);
    //     return [query, queryParams];
    // }

    /**
     * Determines if the Bedes Composite Terms should be searched
     */
    private shouldSearchCompositeTerms(searchOptions?: ISearchOptions): boolean {
        // include searches through BedesCompositeTerm unless it's explicitly disabled
        // ie searchOptions.termListOption.disabled is set,
        // or the name and description are both set to false
        if (searchOptions
            && searchOptions.compositeTerm
            && (
                searchOptions.compositeTerm.disabled
                ||
                (
                    searchOptions.compositeTerm.name === false
                    && searchOptions.compositeTerm.description === false
                )
            )
        ) {
            return false;
        }
        else {
            return true;
        }

    }

    public searchCompositeTerms(searchStrings: Array<string>, searchOptions?: ISearchOptions, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            const [query, params] = this.buildBedesCompositeTermQuery(searchStrings, searchOptions);
            if (transaction) {
                return transaction.manyOrNone(query, params);
            }
            else {
                return db.manyOrNone(query, params);
            }
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in searchCompositeTerms`);
            logger.error(util.inspect(error));
            throw new BedesError(
                error.message,
                HttpStatusCodes.ServerError_500,
                'An error occured querying the database.'
            );
        }
    }

    private buildBedesCompositeTermQuery(searchTerms: Array<string>, searchOptions?: ISearchOptions): [string, any] {
        let searchNumber = 1;
        let sqlSearchList = new Array<string>();
        const queryParams:any = {};
        // extract the search options, if they exist;
        const options = searchOptions && searchOptions.compositeTerm ? searchOptions.compositeTerm : {};
        console.log('bedes composite term search options', options);
        if (options.disabled || (options.name === false && options.description === false)) {
            logger.error('Invalid query parameters for BedesCompositeTerm');
            console.log(searchOptions);
            throw new Error('Invalid query parameters for BedesCompositeTerm');
        }

        for (let searchTerm of searchTerms) {
            const key = `_searchNum${searchNumber++}`;
            const columns: Array<String> = [];
            if (!searchOptions || options.name) {
                columns.push(`t.name ~* \${${key}}`)
            }
            if (!searchOptions || options.description) {
                columns.push(`t.description ~* \${${key}}`)
            }
            sqlSearchList.push(`(${columns.join(' or ')})`);
            queryParams[key] = searchTerm;
        }
        const query = `
            select
                t.id as "_id",
                t.name as "_name",
                t.description as "_description",
                t.unit_id as "_unitId",
                4 as "_resultObjectType"
            from
                public.bedes_composite_term t
            where
                ${sqlSearchList.join(' and ')}
        `;
        logger.debug(query);
        console.log(queryParams);
        return [query, queryParams];
    }

}
