import { ICompositeTermDetail } from './composite-term-detail.interface';
import { BedesTerm } from '../../bedes-term/bedes-term';
import { BedesTermOption } from '../../bedes-term-option/bedes-term-option';

/**
 * Represents a bedes atomic term in a composite term.
 */
export class CompositeTermDetail {
    private _id: number | null | undefined;
    private _term: BedesTerm;
    private _listOption: BedesTermOption | null | undefined;
    private _orderNumber: number;
    private _isValueField: boolean | null | undefined;

    constructor(data: BedesTerm, orderNumber: number, termOption?: BedesTermOption, isValueField?: boolean);
    constructor(data: ICompositeTermDetail);
    constructor(data: ICompositeTermDetail | BedesTerm, orderNumber?: number, listOption?: BedesTermOption, isValueField?: boolean) {
        if (data instanceof BedesTerm) {
            // build the object from a BedesTerm-TermOption object(s)
            if (!data.id) {
                // all bedes terms need an _id value
                throw new Error('BedesTerms must have a valid _id to be used in a composite');
            }
            else if (listOption && !listOption.id) {
                // all list options must have an _id value
                throw new Error('BedesConstrainedListOption must have a valid _id to be used in a composite');
            }
            else if (!orderNumber) {
                // all detail items need a valid orderNumber
                throw new Error(`An orderNumber must be provided when building a ${this.constructor.name} object from a BedesTerm object`);
            }
            this._term = data;
            this._listOption = listOption;
            this._orderNumber = orderNumber;
            this._isValueField = isValueField;
        }
        else {
            if (!data._term || !data._term._id) {
                // all bedes terms need an _id value
                throw new Error('BedesTerms must have a valid _id to be used in a composite');
            }
            else if (data._listOption && !data._listOption._id) {
                // all list options must have an _id value
                throw new Error('BedesConstrainedListOption must have a valid _id to be used in a composite');
            }
            else if (!data._orderNumber) {
                // all detail items need a valid orderNumber
                throw new Error(`An orderNumber must be provided when building a ${this.constructor.name} object from a BedesTerm object`);
            }
            // build the object from the interface data
            this._id = data._id;
            this._term = new BedesTerm(data._term);
            // create the term list option object if it's a constrained list
            // and there's a list option to be mapped
            if (data._listOption) {
                this._listOption = new BedesTermOption(data._listOption);
            }
            this._orderNumber = data._orderNumber;
            this._isValueField = data._isValueField;
        }
    }

    get id():  number | null | undefined {
        return this._id;
    }
    set id(value:  number | null | undefined) {
        this._id = value;
    }
    get term():  BedesTerm {
        return this._term;
    }
    set term(value:  BedesTerm) {
        this._term = value;
    }
    get listOption():  BedesTermOption | null | undefined {
        return this._listOption;
    }
    set listOption(value:  BedesTermOption | null | undefined) {
        this._listOption = value;
    }
    get orderNumber():  number {
        return this._orderNumber;
    }
    set orderNumber(value:  number) {
        this._orderNumber = value;
    }
    get isValueField():  boolean | null | undefined {
        return this._isValueField;
    }
    set isValueField(value:  boolean | null | undefined) {
        this._isValueField = value;
    }

    /**
     * Returns the interface version of the object.
     */
    public toInterface(): ICompositeTermDetail {
        return <ICompositeTermDetail>{
            _id: this.id,
            _term: this.term.toInterface(),
            _listOption: this.listOption ? this.listOption.toInterface() : null,
            _orderNumber: this.orderNumber,
            _isValueField: this.isValueField
        };
    }
}