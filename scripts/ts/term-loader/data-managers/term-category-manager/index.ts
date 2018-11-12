import { BedesTermCategory } from "@bedes-common/models/bedes-term-category";
import { bedesQuery } from "@bedes-backend/bedes/query";
import { GenericDataManager } from "../generic-data-manager";

/**
 * Bedes data type manager.
 */
export class BedesTermCategoryManager extends GenericDataManager<BedesTermCategory> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesTermCategory> {
        let iData = await bedesQuery.termCategory.newRecord({_id: undefined, _name: name});
        return new BedesTermCategory(iData);
    }

    public async getRecordFromDatabase(name: string): Promise<any> {
        try {
            let iData = await bedesQuery.termCategory.getRecordByName(name);
            return new BedesTermCategory(iData);
        } catch {
            return undefined;
        }
    }
}
