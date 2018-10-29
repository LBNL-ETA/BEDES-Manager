import { BedesUnit } from "@bedes-common/bedes-unit";
import { bedesQuery } from "@script-common/queries";
import { GenericDataManager } from "../generic-data-manager";

export class BedesUnitManager extends GenericDataManager<BedesUnit> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesUnit> {
        let iData = await bedesQuery.units.newRecord({ _id: undefined, _name: name })
        return new BedesUnit(iData);
    }

    public async getRecordFromDatabase(name: string): Promise<BedesUnit | undefined> {
        try {
            let iData = await bedesQuery.units.getRecordByName(name);
            return new BedesUnit(iData);
        }
        catch {
            return undefined;
        }
    }

}