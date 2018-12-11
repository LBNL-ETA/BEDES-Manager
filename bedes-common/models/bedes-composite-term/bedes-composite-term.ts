import { ICompositeTermDetail, CompositeTermDetail } from './composite-term-item';
import { IBedesCompositeTerm } from './bedes-composite-term.interface';
import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { BedesConstrainedList } from '../bedes-term/bedes-constrained-list';
import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { buildCompositeTermSignature } from '../../util/build-composite-term-signature';

export class BedesCompositeTerm {
    private _id: number | null | undefined;
    private _signature: string;
    private _items: Array<CompositeTermDetail>

    constructor(data?: IBedesCompositeTerm) {
        this._items = new Array<CompositeTermDetail>();
        if (data) {
            this._id = data._id || undefined;
            this._signature = data._signature;
            if (data._items && data._items.length) {
                data._items.forEach((d) => {
                    if (!d._term._id) {
                        throw new Error('BedesTerms must have valid _id to be used in composite');
                    }
                    this.addTerm(new CompositeTermDetail(d))
                });
                this.orderTerms();
                if (!this.validSignature()) {
                    console.log('CompositeTerm signature mismatch');
                    throw new Error('CompositeTerm signature mismatch');
                }
            }
            else {
                this._signature = '';
            }
        }
        else {
            this._signature = '';
        }
    }

    get id():  number | null | undefined {
        return this._id;
    }
    set id(value:  number | null | undefined) {
        this._id = value;
    }
    get signature():  string {
        return this._signature;
    }
    set signature(value:  string) {
        this._signature = value;
    }
    get items():  Array<CompositeTermDetail> {
        return this._items;
    }

    /**
     * Updates the state of the CompositeTerm, first re-sorting the
     * bedesTerms by orderNumber, then generating the new composite term signature.
     */
    public refresh(): void {
        // reorder the terms by their order numbers.
        this.orderTerms();
        this.signature = buildCompositeTermSignature(this);
    }

    /**
     * Determines if the CompositeTerm signature is valid,
     * ie does the instance's signature equal what the generated one should be?
     *
     * @private
     * @returns {boolean}
     * @memberof BedesCompositeTerm
     */
    private validSignature(): boolean {
        let genSig = buildCompositeTermSignature(this);
        return genSig === this.signature ? true : false;
    }
    
    /**
     * Includes a BedesTerm in the current BedesCompositeTerm definition.
     */
    public addTerm(item: CompositeTermDetail): void {
        this._items.push(item);
        this.refresh();
    }

    /**
     * Add a BedesTerm and optional BedesTermOption to the list of terms.
     */
    public addBedesTerm(term: BedesTerm | BedesConstrainedList, termOption?: BedesTermOption): void {
        const orderNumber = this.getNextOrderNumber();
        if (term instanceof(BedesConstrainedList)) {
            // if it's a constrained list, don't save all the list options
            // so change the constrained list to a regular bedes term
            const newTerm = new BedesTerm(<IBedesTerm>{
                _id: term.id,
                _name: term.name,
                _dataTypeId: term.dataTypeId,
                _description: term.description,
                _definitionSourceId: term.definitionSourceId,
                _termCategoryId: term.termCategoryId,
                _unitId: term.unitId
            });
            this.addTerm(new CompositeTermDetail(newTerm, orderNumber, termOption));
        }
        else {
            this.addTerm(new CompositeTermDetail(term, orderNumber, termOption));
        }
    }

    /**
     * Removes a CompositeTerm, by the id of the BedesTerm not the Composite,
     * from it's list of terms.
     * (id may be undefined whereas the bedes id is always there)
     * 
     */
    public removeTerm(bedesTermId: number): void {
        let index = this._items.findIndex((d) => d.term.id === bedesTermId);
        if (index >= 0) {
            this._items.splice(index, 1);
            this.signature = buildCompositeTermSignature(this);
        }
        else {
            throw new Error(`Attempted to remove a BedesTerm (${bedesTermId}) that doesn't exist`);
        }
    }

    /**
     * Reorders the items in the list by their orderNumber.
     */
    private orderTerms(): void {
        this._items.sort(
            (a: CompositeTermDetail, b: CompositeTermDetail): number => {
                if (a.orderNumber < b.orderNumber) {
                    return -1;
                }
                else if (a.orderNumber > b.orderNumber) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
    }

    /**
     * Generates the display name of the composite term.
     */
    private buildDisplayName(): string {
        return 'display name';
    }

    /**
     * Returns the highest order number in the list + 1
     * (for adding terms and appending to end of the list)
     */
    private getNextOrderNumber(): number {
        const lastNum = this.getLastOrderNumber();
        return lastNum && typeof lastNum === 'number' ? lastNum + 1 : 1;
    }

    /**
     * Returns the highest orderNumber value in the list of terms.
     */
    private getLastOrderNumber(): number | undefined {
        if (this._items.length) {
            return this._items[this._items.length-1].orderNumber;
        }
        else {
            return undefined;
        }
    }

    public toInterface(): IBedesCompositeTerm {
        return <IBedesCompositeTerm>{
            _id: this.id,
            _signature: this.signature,
            _items: this._items.map((d) => d.toInterface())
        }
    }
}