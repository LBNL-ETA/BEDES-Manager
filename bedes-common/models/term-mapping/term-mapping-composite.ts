import { ITermMappingComposite } from './term-mapping-composite.interface';
import { AppTermListOption } from '../app-term/app-term-list-option';

/**
 * Defines the mapping from the parent AppTerm to a BedesCompositeTerm.
 */
export class TermMappingComposite {
    /** The unique id of the mapping object */
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
    /** The name of the mapping */
    private _bedesName: string;
    get bedesName(): string {
        return this._bedesName;
    }
    set bedesName(value: string) {
        this._bedesName = value;
    }
    /** The uuid of the mapped BedesCompositeTerm */
    private _compositeTermUUID: string;
    get compositeTermUUID(): string {
        return this._compositeTermUUID;
    }
    set compositeTermUUID(value: string) {
        this._compositeTermUUID = value;
    }
    
    /**
     * Build the Object instance.
     * @param data The object for defining the object's initial state.
     */
    constructor(data: ITermMappingComposite) {
        this._id = data._id;
        this._appListOptionUUID = data._appListOptionUUID;
        this._compositeTermUUID = data._compositeTermUUID;
        this._bedesName = data._bedesName;
    }

    /**
     * Return's the object instance's data as a JavaScript Object.
     * @returns The instance data as an JavaScript Object conforming to ITermMappingComposite.
     */
    public toInterface(): ITermMappingComposite {
        return <ITermMappingComposite>{
            _id: this._id,
            _appListOptionUUID: this._appListOptionUUID,
            _compositeTermUUID: this._compositeTermUUID,
            _bedesName: this._bedesName
        }
    }

}
