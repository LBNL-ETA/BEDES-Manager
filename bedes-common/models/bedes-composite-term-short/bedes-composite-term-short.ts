import { IBedesCompositeTermShort } from './bedes-composite-term-short.interface';
import { Scope } from '../../enums/scope.enum';
import { BedesCompositeTerm } from '../bedes-composite-term';
import { UUIDGenerator } from '../uuid-generator/uuid-generator';

export class BedesCompositeTermShort extends UUIDGenerator {
    /**
     * Builds a *Short* version of a BedesCompositeTerm.
     * @param term 
     * @returns a BedesCompositeTermShort version of BedesCompositeTerm
     */
    public static fromBedesCompositeTerm(
        term: BedesCompositeTerm
    ): BedesCompositeTermShort {
        const params = <IBedesCompositeTermShort>{
            _id: term.id,
            _uuid: term.uuid,
            _name: term.name,
            _description: term.description,
            _signature: term.signature,
            _unitId: term.unitId,
            _dataTypeId: term.dataTypeId,
            _userId: term.scopeId,
            _scopeId: term.scopeId
        }
        return new BedesCompositeTermShort(params);
    }

    protected _id: number | null | undefined;
    get id():  number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    protected _signature: string;
    get signature():  string {
        return this._signature;
    }
    set signature(value:  string) {
        if (value != this._signature) {
            this._hasChanged = true;
        }
        this._signature = value;
    }
    /** name */
    protected _name: string | null | undefined;
    get name():  string | null | undefined {
        return this._name;
    }
    set name(value:  string | null | undefined) {
        if (value != this._name) {
            this._hasChanged = true;
        }
        this._name = value;
    }
    /** description */
    protected _description: string | null | undefined;
    get description():  string | null | undefined {
        return this._description;
    }
    set description(value:  string | null | undefined) {
        if (value != this._description) {
            this._hasChanged = true;
        }
        this._description = value;
    }
    /** unit id */
    protected _unitId: number | null | undefined;
    get unitId():  number | null | undefined {
        return this._unitId;
    }
    set unitId(value:  number | null | undefined) {
        if (value != this._unitId) {
            this._hasChanged = true;
        }
        this._unitId = value;
    }
    /** data type id */
    protected _dataTypeId: number | null | undefined;
    get dataTypeId():  number | null | undefined {
        return this._dataTypeId;
    }
    set dataTypeId(value:  number | null | undefined) {
        if (value != this._dataTypeId) {
            this._hasChanged = true;
        }
        this._dataTypeId = value;
    }
    /** uuid */
    protected _uuid: string | null | undefined;
    get uuid():  string | null | undefined {
        return this._uuid;
    }
    /** id of the user that created the term */
    protected _userId: number | null | undefined;
    get userId():  number | null | undefined {
        return this._userId;
    }
    /** Scope of the object */
    protected _scopeId: Scope | null | undefined;
    get scopeId():  Scope | null | undefined {
        return this._scopeId;
    }
    /** Scope of the object */
    set scopeId(value: Scope | null | undefined) {
        if (value != this._scopeId) {
            this._hasChanged = true;
        }
        this._scopeId = value;
    }
    /** Owner of the term */
    protected _ownerName: string | null | undefined;
    get ownerName(): string | null | undefined {
        return this._ownerName;
    }

    /**
     * Indicates if the term has undergone changes and needs to be updated.
     */
    protected _hasChanged = false;
    public get hasChanged(): boolean {
        return this._hasChanged;
    }

    /**
     * Put the data back into a clean state
     */
    public clearChangeFlag(): void {
        this._hasChanged = false;
    }

    constructor(data?: IBedesCompositeTermShort) {
        super();
        if (data) {
            this._id = data._id || undefined;
            this._signature = data._signature;
            this._name = data._name;
            this._description = data._description;
            this._unitId = data._unitId;
            this._dataTypeId = data._dataTypeId;
            this._uuid = data._uuid || this.generateUUID();
            this._userId = data._userId || undefined;
            this._scopeId = data._scopeId && data._scopeId in Scope
                ?  data._scopeId
                : undefined;
            this._ownerName = data._ownerName;
        }
        else {
            // no data was passed in
            this._signature = '';
            this._uuid = this.generateUUID();
            this._scopeId = Scope.Private;
        }
    }

    /**
     * Determines if the composite term has protected scope.
     */
    public hasPrivateScope(): boolean {
        return this.scopeId === Scope.Private;
    }

    /**
     * Determines if the composite term has public scope.
     */
    public hasPublicScope(): boolean {
        return this.scopeId === Scope.Public;
    }

    /**
     * Determines if the composite term has approved scope.
     */
    public hasApprovedScope(): boolean {
        return this.scopeId === Scope.Approved;
    }

    public toInterface(): IBedesCompositeTermShort {
        return <IBedesCompositeTermShort>{
            _id: this.id,
            _signature: this.signature,
            _name: this.name,
            _description: this.description,
            _unitId: this.unitId,
            _uuid: this.uuid,
            _userId: this._userId,
            _scopeId: this._scopeId,
            _ownerName: this._ownerName
        }
    }
}
