import { ISearchOptions } from './search-options.interface';
import { SearchOptionSection } from './search-option-section';

export class SearchOptions {
    private _bedesTerm: SearchOptionSection;
    private _bedesConstrainedList: SearchOptionSection;
    private _compositeTerm: SearchOptionSection;

    constructor(data?: ISearchOptions) {
        this._bedesTerm = new SearchOptionSection(
            data._bedesTerm ? data._bedesTerm : undefined
        );
        this._bedesConstrainedList= new SearchOptionSection(
            data._bedesTerm ? data._bedesTerm : undefined
        );
        this._compositeTerm= new SearchOptionSection(
            data._bedesTerm ? data._bedesTerm : undefined
        );
    }

    get bedesTerm():  SearchOptionSection {
        return this._bedesTerm;
    }
    get bedesConstrainedList():  SearchOptionSection {
        return this._bedesConstrainedList;
    }
    get compositeTerm():  SearchOptionSection {
        return this._compositeTerm;
    }
}