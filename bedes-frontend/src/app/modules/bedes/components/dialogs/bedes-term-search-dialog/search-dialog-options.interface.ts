import { SearchResultType } from "@bedes-common/models/bedes-search-result/search-result-type.enum";

export interface ISearchDialogOptions {
    /*
     * Array that indicates which SearchResultType objects
     * should be excluded from the search
    */
    excludeResultType?: Array<SearchResultType>;
    // Array that contains uuid strings to exclude from the result set
    excludeUUID?: Array<string>;
    // Indicates if the table should only display items with uuids
    showOnlyUUID?: boolean;
    // Indicates if the table should ask the API for list options.
    showListOptions?: boolean;
}
