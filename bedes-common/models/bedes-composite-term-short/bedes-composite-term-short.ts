import { IBedesCompositeTermShort } from './bedes-composite-term-short.interface';
import { Scope } from '@bedes-common/enums/scope.enum';
import { BedesCompositeTerm } from '../bedes-composite-term';

export class BedesCompositeTermShort {
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
            _userId: term.scopeId,
            _scopeId: term.scopeId
        }
        return new BedesCompositeTermShort(params);
    }

    /** id */
    private _id: number | null | undefined;
    get id():  number | null | undefined {
        return this._id;
    }
    set id(value:  number | null | undefined) {
        this._id = value;
    }
    /** signature */
    private _signature: string;
    get signature():  string {
        return this._signature;
    }
    set signature(value:  string) {
        this._signature = value;
    }
    /** name */
    private _name: string | null | undefined;
    get name():  string | null | undefined {
        return this._name;
    }
    set name(value:  string | null | undefined) {
        this._name = value;
    }
    /** description */
    private _description: string | null | undefined;
    get description():  string | null | undefined {
        return this._description;
    }
    set description(value:  string | null | undefined) {
        this._description = value;
    }
    /** unit id */
    private _unitId: number | null | undefined;
    get unitId():  number | null | undefined {
        return this._unitId;
    }
    set unitId(value:  number | null | undefined) {
        this._unitId = value;
    }
    /** uuid */
    private _uuid: string | null | undefined;
    get uuid():  string | null | undefined {
        return this._uuid;
    }
    set uuid(value:  string | null | undefined) {
        this._uuid = value;
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

    constructor(data?: IBedesCompositeTermShort) {
        if (data) {
            this._id = data._id || undefined;
            this._signature = data._signature;
            this._name = data._name;
            this._description = data._description;
            this._unitId = data._unitId;
            this._uuid = data._uuid;
            this._userId = data._userId || undefined;
            this._scopeId = data._scopeId && data._scopeId in Scope
                ?  data._scopeId
                : undefined;
        }
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
        }
    }
}