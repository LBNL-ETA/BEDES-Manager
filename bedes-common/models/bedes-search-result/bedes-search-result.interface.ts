import { SearchResultType } from './search-result-type.enum';

export interface IBedesSearchResult {
    _id: number;
    _uuid: string;
    _name: string;
    _description: string;
    _resultObjectType: SearchResultType;
    _dataTypeId: number,
    _unitId: number,
    _termCategoryId: number
}