import { BedesUnitQuery } from "./bedes-unit";
import { BedesDataTypeQuery } from "./bedes-data-type";
import { BedesTermQuery } from "./bedes-term";
import { BedesDefinitionSourceQuery } from "./bedes-definition-source";
import { BedesTermCategoryQuery } from "./bedes-term-category";
import { BedesTermListOptionQuery } from "./bedes-term-list-option";
import { AppQuery } from "./app";
import { AppTermQuery } from "./app-term";
import { MappedTermQuery } from "./mapped-term";
import { BedesTermSearchQuery } from "./bedes-term-search";

class BedesQuery {
    public units: BedesUnitQuery;
    public dataType: BedesDataTypeQuery;
    public terms: BedesTermQuery;
    public termListOption: BedesTermListOptionQuery;
    public definitionSource: BedesDefinitionSourceQuery;
    public termCategory: BedesTermCategoryQuery;
    public app: AppQuery;
    public appTerm: AppTermQuery;
    public mappedTerm: MappedTermQuery;
    public bedesTermSearch: BedesTermSearchQuery;

    constructor() {
        this.units = new BedesUnitQuery();
        this.dataType = new BedesDataTypeQuery();
        this.terms = new BedesTermQuery();
        this.termListOption = new BedesTermListOptionQuery();
        this.definitionSource = new BedesDefinitionSourceQuery();
        this.termCategory = new BedesTermCategoryQuery();
        this.app = new AppQuery();
        this.appTerm = new AppTermQuery();
        this.mappedTerm = new MappedTermQuery();
        this.bedesTermSearch = new BedesTermSearchQuery();
    }
}

// object used to query the BEDES database.
const bedesQuery = new BedesQuery();
export {
    bedesQuery
};