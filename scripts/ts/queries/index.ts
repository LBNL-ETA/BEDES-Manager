import { BedesUnitQuery } from "./bedes-unit";
import { BedesDataTypeQuery } from "./bedes-data-type";

class BedesQuery {
    public units: BedesUnitQuery;
    public dataType: BedesDataTypeQuery;

    constructor() {
        this.units = new BedesUnitQuery();
        this.dataType = new BedesDataTypeQuery();
    }
}

// object used to query the BEDES database.
const bedesQuery = new BedesQuery();
export {
    bedesQuery
};