import { SearchResultType } from './search-result-type.enum';

export interface IBedesSearchResult {
    _id: number;
    _uuid: string;
    _termUUID?: string | null | undefined;
    _termListName?: string | null | undefined;
    _termId?: number | null | undefined;
    _name: string;
    _description: string;
    _resultObjectType: SearchResultType;
    _dataTypeId: number;
    _unitId: number;
    _termCategoryId: number;
    _ownerName?: string;
    _scopeId?: number | null | undefined;
}
