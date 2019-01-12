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
import { BedesCompositeTermQuery } from './bedes-composite-term/index';
import { CompositeTermDetailQuery } from './bedes-composite-term/composite-term-detail';
import { BedesSectorQuery } from './sector/index';
import { BedesTermSectorLinkQuery } from './bedes-term-sector-link/index';
import { AppTermListOptionQuery } from './app-term-list-option/index';

class BedesQuery {
    public units: BedesUnitQuery;
    public dataType: BedesDataTypeQuery;
    public terms: BedesTermQuery;
    public termListOption: BedesTermListOptionQuery;
    public definitionSource: BedesDefinitionSourceQuery;
    public termCategory: BedesTermCategoryQuery;
    public app: AppQuery;
    public appTerm: AppTermQuery;
    public appTermListOption: AppTermListOptionQuery;
    public mappedTerm: MappedTermQuery;
    public bedesTermSearch: BedesTermSearchQuery;
    public compositeTerm: BedesCompositeTermQuery;
    public compositeTermDetail: CompositeTermDetailQuery;
    public sector: BedesSectorQuery;
    public bedesTermSectorLink: BedesTermSectorLinkQuery;

    constructor() {
        this.units = new BedesUnitQuery();
        this.dataType = new BedesDataTypeQuery();
        this.terms = new BedesTermQuery();
        this.termListOption = new BedesTermListOptionQuery();
        this.definitionSource = new BedesDefinitionSourceQuery();
        this.termCategory = new BedesTermCategoryQuery();
        this.app = new AppQuery();
        this.appTerm = new AppTermQuery();
        this.appTermListOption = new AppTermListOptionQuery();
        this.mappedTerm = new MappedTermQuery();
        this.bedesTermSearch = new BedesTermSearchQuery();
        this.compositeTerm = new BedesCompositeTermQuery();
        this.compositeTermDetail = new CompositeTermDetailQuery();
        this.sector = new BedesSectorQuery();
        this.bedesTermSectorLink = new BedesTermSectorLinkQuery();
    }
}

// object used to query the BEDES database.
const bedesQuery = new BedesQuery();
export {
    bedesQuery
};