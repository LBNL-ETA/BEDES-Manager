import { BedesUnitQuery } from "./bedes-unit";

class BedesQuery {
    public unitQuery: BedesUnitQuery;

    constructor() {
        this.unitQuery = new BedesUnitQuery();
    }
}

// object used to query the BEDES database.
const bedesQuery = new BedesQuery();
export {
    bedesQuery
};