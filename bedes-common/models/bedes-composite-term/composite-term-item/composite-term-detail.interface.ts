import { IBedesTerm } from '../../bedes-term/bedes-term.interface';
import { IBedesTermOption } from '../../bedes-term-option/bedes-term-option.interface';

/**
 * Represents a Bedes Atomic Term in a composite term.
 */
export interface ICompositeTermDetail {
    _id?: number | null | undefined;
    _term: IBedesTerm;
    _listOption?: IBedesTermOption | null | undefined;
    _isValueField?: boolean | null | undefined;
    _orderNumber: number;
}
