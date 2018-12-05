import { ICompositeTermDetail } from './composite-term-item/composite-term-detail.interface';

export interface IBedesCompositeTerm {
    _id?: number | null | undefined;
    _signature: string;
    _items: Array<ICompositeTermDetail>;
}