import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { ICompositeTermDetailRequestResult } from './composite-term-detail-request-result.interface';

/**
 * Defines the data object returned from the composite term detail request.
 */
export class CompositeTermDetailRequestResult {
    // the bedes term
    private _term: BedesTerm;
    get term(): BedesTerm {
        return this._term;
    }
    // list option, if applicable
    private _listOption: BedesTermOption | null | undefined;
    get listOption(): BedesTermOption | null | undefined {
        return this._listOption;
    }

    constructor(data: ICompositeTermDetailRequestResult) {
        this._term = new BedesTerm(data.term);
        if (data.listOption) {
            this._listOption = new BedesTermOption(data.listOption);
        }
        else {
            this._listOption = undefined;
        }
    }
}