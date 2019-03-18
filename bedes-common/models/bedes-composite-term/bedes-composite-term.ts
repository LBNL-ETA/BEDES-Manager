import { ICompositeTermDetail, CompositeTermDetail } from './composite-term-item';
import { IBedesCompositeTerm } from './bedes-composite-term.interface';
import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { BedesConstrainedList } from '../bedes-term/bedes-constrained-list';
import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { buildCompositeTermSignature } from '../../util/build-composite-term-signature';
import { IBedesConstrainedList } from '../bedes-term/bedes-constrained-list.interface';
import { UUIDGenerator } from '../uuid-generator/uuid-generator';
import { Scope } from '../../enums/scope.enum';

export class BedesCompositeTerm extends UUIDGenerator {
    private _id: number | null | undefined;
    get id():  number | null | undefined {
        return this._id;
    }
    set id(value:  number | null | undefined) {
        this._id = value;
    }
    private _signature: string;
    get signature():  string {
        return this._signature;
    }
    set signature(value:  string) {
        if (value != this._signature) {
            this._hasChanged = true;
        }
        this._signature = value;
    }
    private _name: string | null | undefined;
    get name():  string | null | undefined {
        return this._name;
    }
    set name(value:  string | null | undefined) {
        if (value != this._name) {
            this._hasChanged = true;
        }
        this._name = value;
    }
    private _description: string | null | undefined;
    get description():  string | null | undefined {
        return this._description;
    }
    set description(value:  string | null | undefined) {
        if (value != this._description) {
            this._hasChanged = true;
        }
        this._description = value;
    }
    private _unitId: number | null | undefined;
    get unitId():  number | null | undefined {
        return this._unitId;
    }
    set unitId(value:  number | null | undefined) {
        if (value != this._unitId) {
            this._hasChanged = true;
        }
        this._unitId = value;
    }
    /** UUID */
    private _uuid: string;
    get uuid():  string | null | undefined {
        return this._uuid;
    }
    /** CompositeTermDetail items */
    private _items: Array<CompositeTermDetail>
    get items():  Array<CompositeTermDetail> {
        return this._items;
    }
    /** id of the user that created the term */
    private _userId: number | null | undefined;
    get userId():  number | null | undefined {
        return this._userId;
    }
    /** Scope of the object */
    private _scopeId: Scope | null | undefined;
    get scopeId():  Scope | null | undefined {
        return this._scopeId;
    }

    /**
     * Indicates if the term has undergone changes and needs to be updated.
     */
    private _hasChanged = false;
    public get hasChanged(): boolean {
        return this._hasChanged;
    }
    public clearChangeFlag(): void {
        this._hasChanged = false;
    }

    constructor(data?: IBedesCompositeTerm) {
        super();
        this._items = new Array<CompositeTermDetail>();
        if (data) {
            this._id = data._id || undefined;
            this._signature = data._signature;
            this._name = data._name;
            this._description = data._description;
            this._unitId = data._unitId;
            this._uuid = data._uuid || this.generateUUID();
            this._userId = data._userId || undefined;
            this._scopeId = data._scopeId && data._scopeId in Scope
                ?  data._scopeId
                : undefined;
            // Set the detail items
            if (data._items && data._items.length) {
                data._items.forEach((item: ICompositeTermDetail) => {
                    if (!item._term._id) {
                        console.log(item);
                        throw new Error('BedesTerms must have valid _id to be used in composite');
                    }
                    this.addTerm(new CompositeTermDetail(item))
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
            // no data was passed in
            this._signature = '';
            this._uuid = this.generateUUID();
            this._scopeId = Scope.Private;
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
            _description: this.description,
            _unitId: this.unitId,
            _uuid: this.uuid,
            _userId: this._userId,
            _scopeId: this._scopeId,
            _items: this._items.map((d) => d.toInterface())
        }
    }
}