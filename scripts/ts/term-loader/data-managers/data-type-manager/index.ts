import { BedesDataType } from "@bedes-common/bedes-data-type";
import { bedesQuery } from "../../queries";
import { GenericDataManager } from "../../data-managers/generic-data-manager";

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
        let iData = await bedesQuery.dataType.getRecordByName(name);
        if (iData) {
            return new BedesDataType(iData);
        }
        else {
            return undefined;
        }
    }

}