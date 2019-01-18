import { ISearchOptionSection } from './search-option-section.interface';

export class SearchOptionSection {
    // entire section disabled?
    private _disabled: boolean | null | undefined;
    get disabled(): boolean | null | undefined {
        return this._disabled;
    }
    set disabled(value: boolean | null | undefined) {
        this._disabled = value;
    }
    // name search disabled?
    private _nameDisabled: boolean | null | undefined;
    get nameDisabled(): boolean | null | undefined {
        return this._nameDisabled;
    }
    set nameDisabled(value: boolean | null | undefined) {
        this._nameDisabled = value;
    }
    // description search disabled?
    private _descriptionDisabled: boolean | null | undefined;
    get descriptionDisabled(): boolean | null | undefined {
        return this._descriptionDisabled;
    }
    set descriptionDisabled(value: boolean | null | undefined) {
        this._descriptionDisabled = value;
    }

    /**
     * Build the object intsance.
     */
    constructor(data?: ISearchOptionSection) {
        // section search disabled?
        this._disabled = data && data._disabled ? true : false;
        // name search is disabled?
        this._nameDisabled = data && data._nameDisabled ? true : false;
        // description search is disabled?
        this._descriptionDisabled = data && data._descriptionDisabled ? true : false;
    }


    /**
     * Determines if this entire section has been excluded from the search.
     */
    public isEnabled(): boolean {
        if (this.disabled || (this.nameDisabled && this.descriptionDisabled)) {
            return false;
        }
        else {
            return true;
        }
    }

}