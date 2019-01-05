import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';

export interface ISearchResultRow {
    name: string,
    uuid: string,
    categoryName: string,
    unitName: string,
    dataTypeName: string,
    ref: BedesSearchResult,
    searchResultTypeName: string
}
