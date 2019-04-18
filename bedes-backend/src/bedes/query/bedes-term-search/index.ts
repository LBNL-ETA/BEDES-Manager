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
import { ISearchOptionSection } from '@bedes-common/models/search-options/search-option-section.interface';
import { SearchQueryBuilder } from '../../models/search-query-builder/search-query-builder';
import { QueryBuilderOutput } from '../../models/search-query-builder/query-builder-output/query-builder.output';
import { SearchOptions } from '../../../../../bedes-common/models/search-options/search-options';

export class BedesTermSearchQuery {
    public async searchAllBedesTerms(
        searchStrings: Array<string>,
        searchOptions?: ISearchOptions,
        transaction?: any
    ): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            // TODO: ignore params?
            let searchOptions = new SearchOptions(<ISearchOptions>{
                _bedesTerm: {
                    _disabled: false,
                    _nameDisabled: false,
                    _descriptionDisabled: true
                },
                _bedesTermListOption: {
                    _disabled: false,
                    _nameDisabled: false,
                    _descriptionDisabled: true
                },
                _compositeTerm: {
                    _disabled: false,
                    _nameDisabled: false,
                    _descriptionDisabled: true 
                }
            });
            // instantiate the sql query condition builder
            const builder = new SearchQueryBuilder(searchOptions);
            // only use the first search string
            // TODO: allow more search strings?
            const builderOutput = builder.run(searchStrings[0]);
            // create the promise array
            let promises = new Array<Promise<Array<IBedesSearchResult>>>();
            if (searchOptions.bedesTerm.isEnabled()) {
                promises.push(this.searchBedesTerms(searchStrings, builderOutput, transaction))
            }
            if (searchOptions.bedesTermListOption.isEnabled()) {
                promises.push(this.searchListTermOption(searchStrings, builderOutput, transaction));
            }
            if (searchOptions.compositeTerm.isEnabled()) {
                promises.push(this.searchCompositeTerms(searchStrings, builderOutput, transaction));
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
     * Searches for BedesTerms using the Regex string parameter searchString.
     */
    public searchBedesTerms(searchStrings: Array<string>, builderOutput: QueryBuilderOutput, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            const [query, params] = this.buildBedesTermQuery(searchStrings, builderOutput);
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
    private buildBedesTermQuery(searchTerms: Array<string>, builderOutput: QueryBuilderOutput): [string, any] {
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
                end as "_resultObjectType",
                null as "_ownerName",
                null as "_scopeId"
            from
                public.bedes_term t
            where
                ${builderOutput.bedesTerm.getSqlConditions()}
        `;
        logger.debug(query);
        return [query, builderOutput.bedesTerm.buildSqlVariableObject()];
    }

    /**
     * Search list term options.
     */
    public searchListTermOption(searchStrings: Array<string>, builderOutput: QueryBuilderOutput, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: searchListTermOption`);
                throw new Error('Missing required parameters.');
            }
            const [query, params] = this.buildListTermOptionQuery(searchStrings, builderOutput);
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

    private buildListTermOptionQuery(searchTerms: Array<string>, builderOutput: QueryBuilderOutput): [string, any] {
        const query = `
            select
                t.id as "_id",
                t.uuid as "_uuid",
                b.uuid as "_termUUID",
                t.term_id as "_termId",
                t.name as "_name",
                t.description as "_description",
                t.unit_id as "_unitId",
                3 as "_resultObjectType",
                null as "_ownerName",
                null as "_scopeId"
            from
                bedes_term_list_option as t
            join
                bedes_term b on b.id = t.term_id
            where
                ${builderOutput.bedesTermListOption.getSqlConditions()}
        `;
        logger.debug(query);
        return [query, builderOutput.bedesTermListOption.buildSqlVariableObject()];
    }
    
    public searchCompositeTerms(searchStrings: Array<string>, builderOutput: QueryBuilderOutput, transaction?: any): Promise<Array<IBedesSearchResult>> {
        try {
            if (!searchStrings || !(searchStrings instanceof Array) || !searchStrings.length) {
                logger.error(`${this.constructor.name}: search strings`);
                throw new Error('Missing required parameters.');
            }
            const [query, params] = this.buildBedesCompositeTermQuery(searchStrings, builderOutput);
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

    private buildBedesCompositeTermQuery(searchTerms: Array<string>, builderOutput: QueryBuilderOutput): [string, any] {
       const query = `
            select
                t.id as "_id",
                t.name as "_name",
                t.description as "_description",
                t.unit_id as "_unitId",
                t.uuid as "_uuid",
                4 as "_resultObjectType",
                au.first_name || ' ' || au.last_name as "_ownerName",
                scope_id as "_scopeId"
            from
                public.bedes_composite_term t
            join
                auth.user as au on au.id = t.user_id
            where
            ${builderOutput.compositeTerm.getSqlConditions()}
        `;
        logger.debug(query);
        return [query, builderOutput.compositeTerm.buildSqlVariableObject()];
    }

}
