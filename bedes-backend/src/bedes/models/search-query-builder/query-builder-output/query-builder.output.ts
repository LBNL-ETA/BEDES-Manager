import { QueryOutputSection } from '../query-output.section';
import { QuerySection } from '../query-section.enum';
import { BedesConstrainedList } from '../../../../../../bedes-common/models/bedes-term/bedes-constrained-list';

export class QueryBuilderOutput {
    // Class Attributes
    // BedesTerm output
    private _bedesTerm: QueryOutputSection;
    public get bedesTerm() : QueryOutputSection {
        return this._bedesTerm;
    }
    // BedesConstrainedList output
    private _bedesConstrainedList: QueryOutputSection;
    public get bedesConstrainedList(): QueryOutputSection {
        return this._bedesConstrainedList;
    }
    // BedesTermListOption
    private _bedesTermListOption: QueryOutputSection;
    public get bedesTermListOption() : QueryOutputSection {
        return this._bedesTermListOption;
    }
    // 
    private _compositeTerm: QueryOutputSection;
    public get compositeTerm() : QueryOutputSection {
        return this._compositeTerm;
    }

    /**
     * Build the object instance.
     */
    constructor() {
        this._bedesTerm = new QueryOutputSection(QuerySection.BedesTerm);
        this._bedesConstrainedList= new QueryOutputSection(QuerySection.BedesConstrainedList);
        this._bedesTermListOption = new QueryOutputSection(QuerySection.BedesTermListOption);
        this._compositeTerm = new QueryOutputSection(QuerySection.CompositeTerm);
    }
}