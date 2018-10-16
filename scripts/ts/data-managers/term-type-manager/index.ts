import { BedesTermType } from "../../../../bedes-common/bedes-term-type";
import { bedesQuery } from "../../queries";
import { GenericDataManager } from "../../data-managers/generic-data-manager";

/**
 * Bedes data type manager.
 */
export class BedesTermTypeManager extends GenericDataManager<BedesTermType> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesTermType> {
        let iData = await bedesQuery.termType.newRecord({_id: undefined, _name: name});
        return new BedesTermType(iData);
    }

    public async getRecordFromDatabase(name: string): Promise<any> {
        let iData = await bedesQuery.termType.getRecordByName(name);
        if (iData) {
            return new BedesTermType(iData);
        }
        else {
            return undefined;
        }
    }
}
