import { ITermMappingAtomic } from './term-mapping-atomic.interface';
import { TermType } from '../../enums/term-type.enum';

/**
 * Defines a mapping between the parent atomic term
 * and a bedes term.
 */
export class TermMappingAtomic {
    /**
     * The id of the term mapping record
     */
    private _id: number | null | undefined;
    get id(): number | null | undefined {
        return this._id;
    }
    set id(value: number | null | undefined) {
        this._id = value;
    }
    /**
     * The uuid of the mapped AppTermListOption, if applicable
     */
    private _appListOptionUUID: string | null | undefined;
    get appListOptionUUID(): string | null | undefined {
        return this._appListOptionUUID;
    }
    set appListOptionUUID(value: string | null | undefined) {
        this._appListOptionUUID = value;
    }
    /**
     * Name of the bedes term in the mapping.
     */
    private _bedesName: string;
    get bedesName(): string {
        return this._bedesName;
    }
    set bedesName(value: string) {
        this._bedesName = value;
    }
    /**
     * The bedes term's TermType, ie constrained list or value
     */
    private _bedesTermType: TermType;
    get bedesTermType(): TermType {
        return this._bedesTermType;
    }
    set bedesTermType(value: TermType) {
        this._bedesTermType = value;
    }
    /**
     * The uuid of the mapped bedes term.
     */
    private _bedesTermUUID: string;
    get bedesTermUUID(): string {
        return this._bedesTermUUID;
    }
    set bedesTermUUID(value: string) {
        this._bedesTermUUID = value;
    }
    /**
     * The uuid of the mapped bedes term list option.
     */
    private _bedesListOptionUUID: string | null | undefined;
    get bedesListOptionUUID(): string | null | undefined {
        return this._bedesListOptionUUID;
    }
    set bedesListOptionUUID(value: string | null | undefined) {
        this._bedesListOptionUUID = value;
    }
    
    /**
     * Creates an instance of term mapping atomic.
     * @param data The initial values to use for the object instance.
     */
    constructor(data: ITermMappingAtomic) {
        this._id = data._id;
        this._appListOptionUUID = data._appListOptionUUID;
        this._bedesTermUUID = data._bedesTermUUID
        this._bedesTermType = data._bedesTermType;
        this._bedesListOptionUUID = data._bedesListOptionUUID;
        this._bedesName = data._bedesName;
    }

    /**
     * Returns the object instance as a regular Object conforming to ITermMappingAtomic.
     * @returns The class instance a a JavaScript object conforming to ITermMappingAtomic.
     */
    public toInterface(): ITermMappingAtomic {
        return <ITermMappingAtomic>{
            _id: this._id,
            _appListOptionUUID: this._appListOptionUUID,
            _bedesListOptionUUID: this._bedesListOptionUUID,
            _bedesTermUUID: this._bedesTermUUID,
            _bedesTermType: this._bedesTermType,
            _bedesName: this._bedesName
        };
    }

}

