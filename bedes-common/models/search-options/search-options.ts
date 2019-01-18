import { ISearchOptions } from './search-options.interface';
import { SearchOptionSection } from './search-option-section';

export class SearchOptions {
    private _bedesTerm: SearchOptionSection;
    private _bedesConstrainedList: SearchOptionSection;
    private _bedesTermListOption: SearchOptionSection;
    private _compositeTerm: SearchOptionSection;

    // build the object instance
    constructor(data?: ISearchOptions) {
        this._bedesTerm = new SearchOptionSection(
            data ? data._bedesTerm : undefined
        );
        this._bedesConstrainedList= new SearchOptionSection(
            data ? data._bedesConstrainedList : undefined
        );
        this._bedesTermListOption = new SearchOptionSection(
            data ? data._bedesTermListOption : undefined
        );
        this._compositeTerm = new SearchOptionSection(
            data ? data._compositeTerm: undefined
        );
    }

    get bedesTerm():  SearchOptionSection {
        return this._bedesTerm;
    }
    get bedesConstrainedList():  SearchOptionSection {
        return this._bedesConstrainedList;
    }
    get bedesTermListOption():  SearchOptionSection {
        return this._bedesTermListOption;
    }
    get compositeTerm():  SearchOptionSection {
        return this._compositeTerm;
    }

}