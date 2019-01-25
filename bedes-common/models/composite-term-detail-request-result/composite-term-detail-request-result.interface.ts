import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { IBedesTermOption } from '../bedes-term-option/bedes-term-option.interface';

/**
 * Defines the data object returned from the composite term detail request.
 */
export interface ICompositeTermDetailRequestResult {
    term: IBedesTerm;
    listOption?: IBedesTermOption | null | undefined;
}