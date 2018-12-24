import { IBedesTermSectorLink } from '../bedes-term-sector-link/bedes-term-sector-link.interface';
export interface IBedesTerm {
    _id?: number | null | undefined;
    _termCategoryId: number;
    _name: string;
    _description: string;
    _dataTypeId: number;
    _unitId?: number | null | undefined;
    _definitionSourceId?: number | null | undefined;
    _uuid: string | null | undefined;
    _url: string | null | undefined;
    _sectors: Array<IBedesTermSectorLink>
}
