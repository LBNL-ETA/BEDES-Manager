import { ICompositeTermDetail, CompositeTermDetail } from './composite-term-item';
import { IBedesCompositeTerm } from './bedes-composite-term.interface';
import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { BedesConstrainedList } from '../bedes-term/bedes-constrained-list';
import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { buildCompositeTermSignature } from '../../util/build-composite-term-signature';
import { IBedesConstrainedList } from '../bedes-term/bedes-constrained-list.interface';
import { BedesMappingLabel } from '../../../scripts/ts/mappings-loader/mappings/base/bedes-mapping-label';

export class BedesCompositeTerm {
    private _id: number | null | undefined;
    private _signature: string;
    private _name: string | null | undefined;
    private _description: string | null | undefined;
    private _unitId: number | null | undefined;
    private _items: Array<CompositeTermDetail>

    constructor(data?: IBedesCompositeTerm) {
        this._items = new Array<CompositeTermDetail>();
        if (data) {
            this._id = data._id || undefined;
            this._signature = data._signature;
            this._name = data._name;
            this._description = data._description;
            this._unitId = data._unitId;
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
    get name():  string | null | undefined {
        return this._name;
    }
    set name(value:  string | null | undefined) {
        this._name = value;
    }
    get description():  string | null | undefined {
        return this._description;
    }
    set description(value:  string | null | undefined) {
        this._description = value;
    }
    get unitId():  number | null | undefined {
        return this._unitId;
    }
    set unitId(value:  number | null | undefined) {
        this._unitId = value;
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
        this.name = this.buildDisplayName();

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

    public toInterface(): IBedesCompositeTerm {
        return <IBedesCompositeTerm>{
            _id: this.id,
            _signature: this.signature,
            _name: this.name,
            _unitId: this.unitId,
            _items: this._items.map((d) => d.toInterface())
        }
    }
}