import { BedesDataType } from "@bedes-common/bedes-data-type";
// import { bedesQuery } from "@script-common/queries";
import { bedesQuery } from "@bedes-backend/bedes/query";
import { GenericDataManager } from "../generic-data-manager";

/**
 * 
 */
export class BedesDataTypeManager extends GenericDataManager<BedesDataType> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesDataType> {
        let iData = await bedesQuery.dataType.newRecord({ _id: undefined, _name: name });
        return new BedesDataType(iData);
    }

    public async getRecordFromDatabase(name: string): Promise<BedesDataType | undefined> {
        try {
            let iData = await bedesQuery.dataType.getRecordByName(name);
            return new BedesDataType(iData);
        } catch {
            // the record doesn't exist in the database
            // ignore and return undefined
            return undefined;
        }
    }

}