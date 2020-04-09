import { ICompositeTermDetail } from './composite-term-item/composite-term-detail.interface';
import { Scope } from '../../enums/scope.enum';

export interface IBedesCompositeTerm {
    _id?: number | null | undefined;
    _signature: string;
    _name: string | null | undefined;
    _description?: string | null | undefined;
    _unitId?: number | null | undefined;
    _dataTypeId: number | null | undefined;
    _items: Array<ICompositeTermDetail>;
    _uuid?: string | null | undefined;
    _userId?: number | null | undefined;
    _scopeId?: Scope | null | undefined;
    _ownerName?: string | null | undefined;
}
