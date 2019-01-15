import { ISearchOptionSection } from './search-option-section.interface';

export class SearchOptionSection {
    private _disabled: boolean | null | undefined;
    private _name: boolean | null | undefined;
    private _description: boolean | null | undefined;

    constructor(data?: ISearchOptionSection) {
        if (data) {
            this._disabled = data._disabled;
            this._name = data._name;
            this._description = data._description;
        }
    }

    get disabled(): boolean | null | undefined {
        return this._disabled;
    }
    set disabled(value: boolean | null | undefined) {
        this._disabled = value;
    }
    get name(): boolean | null | undefined {
        return this._name;
    }
    set name(value: boolean | null | undefined) {
        this._name = value;
    }
    get description(): boolean | null | undefined {
        return this._description;
    }
    set description(value: boolean | null | undefined) {
        this._description = value;
    }
}