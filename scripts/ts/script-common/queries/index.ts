import { BedesUnitQuery } from "./bedes-unit";
import { BedesDataTypeQuery } from "./bedes-data-type";
import { BedesTermQuery } from "./bedes-term";
import { BedesDefinitionSourceQuery } from "./bedes-definition-source";
import { BedesTermTypeQuery } from "./bedes-term-type";
import { BedesTermListOptionQuery } from "./bedes-term-list-option";

class BedesQuery {
    public units: BedesUnitQuery;
    public dataType: BedesDataTypeQuery;
    public terms: BedesTermQuery;
    public termListOption: BedesTermListOptionQuery;
    public definitionSource: BedesDefinitionSourceQuery
    public termType: BedesTermTypeQuery

    constructor() {
        this.units = new BedesUnitQuery();
        this.dataType = new BedesDataTypeQuery();
        this.terms = new BedesTermQuery();
        this.termListOption = new BedesTermListOptionQuery();
        this.definitionSource = new BedesDefinitionSourceQuery();
        this.termType = new BedesTermTypeQuery();
    }
}

// object used to query the BEDES database.
const bedesQuery = new BedesQuery();
export {
    bedesQuery
};