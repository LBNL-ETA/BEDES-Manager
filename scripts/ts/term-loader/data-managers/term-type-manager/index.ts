import { BedesTermType } from "@bedes-common/models/bedes-term-type";
import { bedesQuery } from "@bedes-backend/bedes/query";
import { GenericDataManager } from "../generic-data-manager";

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
        try {
            let iData = await bedesQuery.termType.getRecordByName(name);
            return new BedesTermType(iData);
        } catch {
            return undefined;
        }
    }
}
