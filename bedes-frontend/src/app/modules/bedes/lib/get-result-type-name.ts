import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';

/**
 * Returns a description of a given SearchResultType object.
 */
export function getResultTypeName(searchResultType: SearchResultType): string {
    if (searchResultType === SearchResultType.BedesTerm) {
        return 'BEDES Term';
    }
    else if (searchResultType === SearchResultType.BedesConstrainedList) {
        return 'Constrained List';
    }
    else if (searchResultType === SearchResultType.BedesTermOption) {
        return 'Constrained List Option';
    }
    else if (searchResultType === SearchResultType.CompositeTerm) {
        return 'Composite Term';
    }
    else {
        '';
    }
}
