
export interface IBedesTermSummary {
    _id: number;
    _termCategoryId: number;
    _name: string;
    _description: string;
    _dataTypeId: number;
    _unitId?: number | null | undefined;
    _definitionSourceId?: number | null | undefined;
    _uuid: string | null | undefined;
    _url: string | null | undefined;
    _sectorNames: Array<string>

}