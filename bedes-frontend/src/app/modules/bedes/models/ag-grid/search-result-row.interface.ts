import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';

/**
 * Defines data object passed to ag-grid for each row.
 */
export interface ISearchResultRow {
    name: string,
    uuid: string,
    categoryName: string,
    unitName: string,
    dataTypeName: string,
    ref: BedesSearchResult,
    searchResultTypeName: string
}
