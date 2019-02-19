import { ITermMappingListOption } from './term-mapping-list-option.interface';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';

export class TermMappingListOption {
    /** id of the object record */
    private _id: number | null | undefined;
	get id(): number  {
		return this.id;
	}
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
            this._id = data._id;
            this._bedesTermOptionUUID = data._bedesTermOptionUUID;
            this._bedesOptionName = data._bedesOptionName;
        }
    }

    /**
     * Determines if the instance represents a valid mapping.
     * @returns true if the mapping is valid.
     */
    public isValid(): boolean {
        return this._bedesTermOptionUUID ? true : false;
    }

    public toInterface(): ITermMappingListOption {
        return <ITermMappingListOption>{
            _bedesTermOptionUUID: this._bedesTermOptionUUID
        };
    }
}