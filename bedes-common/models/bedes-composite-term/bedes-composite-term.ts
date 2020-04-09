import { ICompositeTermDetail, CompositeTermDetail } from './composite-term-item';
import { IBedesCompositeTerm } from './bedes-composite-term.interface';
import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { BedesConstrainedList } from '../bedes-term/bedes-constrained-list';
import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { buildCompositeTermSignature } from '../../util/build-composite-term-signature';
import { IBedesConstrainedList } from '../bedes-term/bedes-constrained-list.interface';
import { BedesCompositeTermShort } from '../bedes-composite-term-short';


export class BedesCompositeTerm extends BedesCompositeTermShort {
    // function to sort detail items by order number
    public static detailItemSorter = (a: CompositeTermDetail, b: CompositeTermDetail) => {
        if(a.orderNumber < b.orderNumber) {
            return -1;
        }
        else if (a.orderNumber > b.orderNumber) {
            return 1;
        }
        else {
            return 0;
        }
    }

    /** CompositeTermDetail items */
    private _items: Array<CompositeTermDetail>
    get items():  Array<CompositeTermDetail> {
        return this._items;
    }

    constructor(data?: IBedesCompositeTerm) {
        super(data);
        this._items = new Array<CompositeTermDetail>();
        if (data) {
            // Set the detail items
            if (data._items && data._items.length) {
                data._items.forEach((item: ICompositeTermDetail) => {
                    if (!item._term._id) {
                        throw new Error('BedesTerms must have valid _id to be used in composite');
                    }
                    this.addTerm(new CompositeTermDetail(item))
                });
                this.refresh();
                if (!this.validSignature()) {
                    console.log('CompositeTerm signature mismatch');
                    throw new Error('CompositeTerm signature mismatch');
                }
            }
            else {
                this._signature = '';
            }
        }
        // reset all changes
        this.clearChangeFlag();
    }

    /**
     * Updates the state of the CompositeTerm, first re-sorting the
     * bedesTerms by orderNumber, then generating the new composite term signature.
     */
    public refresh(): void {
        // reorder the terms by their order numbers.
        this.orderTerms();
        this.signature = buildCompositeTermSignature(this);
        this.name = this.buildDisplayName();

    }

    /**
     * Determines if the bedesTerm has been saved to the database or not.
     */
    public isNewTerm(): boolean {
        return this._id && this._id > 0 ? false : true;
    }

    /**
     * Determines if the CompositeTerm signature is valid,
     * ie does the instance's signature equal what the generated one should be?
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
    public addBedesTerm(term: BedesTerm | BedesConstrainedList, isValueField?: boolean, termOption?: BedesTermOption): void {
        // throw an error on a duplicate BedesTerm.
        // if (this.termExistsInDefinition(term.toInterface())) {
        //     console.error(`${this.constructor.name}: BedesTerm already in composite term definition`);
        //     throw new Error(`${this.constructor.name}: BedesTerm already in composite term definition`);
        // }
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
            this.addTerm(new CompositeTermDetail(newTerm, orderNumber, termOption, isValueField));
        }
        else {
            this.addTerm(new CompositeTermDetail(term, orderNumber, termOption, isValueField));
        }
    }

    /**
     * Determines if the given BedesTerm is already apart of the composite term.
     */
    public termExistsInDefinition(term: IBedesTerm | IBedesConstrainedList): boolean {
        if (!term._id) {
            throw new Error('Bedes terms must have an id (ie saved to the database) to be used in a composite term');
        }
        return this._items.find((d) => d.term.id === term._id) ? true : false;
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
            this.refresh();
        }
        else {
            throw new Error(`Attempted to remove a BedesTerm (${bedesTermId}) that doesn't exist`);
        }
    }

    /**
     * Remove an atomic term from the composite instance.
     */
    public removeDetailItem(item: CompositeTermDetail): void {
        let index = this._items.findIndex((d) => d === item);
        if (index >= 0) {
            this._items.splice(index, 1);
            this.refresh();
        }
        else {
            throw new Error(`Attempted to remove a CompositeTermDetail object that doesn't exist`);
        }
    }

    /**
     * Reorders the items in the list by their orderNumber.
     */
    private orderTerms(): void {
        this._items.sort(BedesCompositeTerm.detailItemSorter);
    }

    /**
     * Generates the display name of the composite term.
     */
    private buildDisplayName(): string {
        let parts = new Array<string>();
        this._items.forEach((termDetail: CompositeTermDetail) => {
            if (termDetail.listOption) {
                parts.push(termDetail.listOption.name);
            }
            else {
                parts.push(termDetail.term.name);
            }
        });
        return parts.join(' ');
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

    /**
     * Determines if the composite term qualifies as a constrained list
     */
    public isConstrainedList(): boolean {
        const lastTerm = this.getLastDetailItem();
        return lastTerm && lastTerm.term.isConstrainedList()
            ? true
            : false;
    }

    /**
     * Returns the last item in the term list
     * @returns last detail item 
     */
    public getLastDetailItem(): CompositeTermDetail | undefined {
        return this._items.length
            ? this._items[this._items.length - 1]
            : undefined;
    }

    public toInterface(): IBedesCompositeTerm {
        return <IBedesCompositeTerm>{
            _id: this.id,
            _signature: this.signature,
            _name: this.name,
            _description: this.description,
            _unitId: this.unitId,
            _dataTypeId: this.dataTypeId,
            _uuid: this.uuid,
            _userId: this._userId,
            _scopeId: this._scopeId,
            _ownerName: this._ownerName,
            _items: this._items.map((d) => d.toInterface())
        }
    }
}