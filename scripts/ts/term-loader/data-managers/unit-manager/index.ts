import { BedesUnit } from "../../../../../bedes-common/bedes-unit";
import { bedesQuery } from "../../queries";
import { GenericDataManager } from "../../data-managers/generic-data-manager";

export class BedesUnitManager extends GenericDataManager<BedesUnit> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesUnit> {
        let iData = await bedesQuery.units.newRecord({ _id: undefined, _name: name })
        return new BedesUnit(iData);
    }

    public async getRecordFromDatabase(name: string): Promise<BedesUnit | undefined> {
        let iData = await bedesQuery.units.getRecordByName(name);
        if (iData) {
            return new BedesUnit(iData);
        }
        else {
            return undefined;
        }
    }

}