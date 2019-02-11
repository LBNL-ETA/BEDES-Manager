import { ITermMappingListOption } from './term-mapping-list-option.interface';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';

export class TermMappingListOption {
    // bedesTermOptionUUID
    private _bedesTermOptionUUID: string | null | undefined;
    get bedesTermOptionUUID(): string | null | undefined {
        return this._bedesTermOptionUUID;
    }
    set bedesTermOptionUUID(value: string | null | undefined) {
        this._bedesTermOptionUUID = value;
    }
    // bedesOptionName
    private _bedesOptionName: string | null | undefined;
    get bedesOptionName(): string | null | undefined {
        return this._bedesOptionName;
    }
    set bedesOptionName(value: string | null | undefined) {
        this._bedesOptionName = value;
    }

    /**
     * Build the object instance.
     */
    constructor(data?: ITermMappingListOption) {
        if (data) {
            this._bedesTermOptionUUID = data._bedesTermOptionUUID;
            this._bedesOptionName = data._bedesOptionName;
        }
    }

    public isValid(): boolean {
        return this._bedesTermOptionUUID ? true : false;
    }

    public toInterface(): ITermMappingListOption {
        return <ITermMappingListOption>{
            _bedesTermOptionUUID: this._bedesTermOptionUUID
        };
    }
}