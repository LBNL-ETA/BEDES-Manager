import { BedesDefinitionSource } from "../../../../bedes-common/bedes-definition-source";
import { bedesQuery } from "../../queries";
import { GenericDataManager } from "../../data-managers/generic-data-manager";

/**
 * Bedes data type manager.
 */
export class BedesDefinitionSourceManager extends GenericDataManager<BedesDefinitionSource> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesDefinitionSource> {
        let iData = await bedesQuery.definitionSource.newRecord({_id: undefined, _name: name});
        return new BedesDefinitionSource(iData);
    }

    public async getRecordFromDatabase(name: string): Promise<BedesDefinitionSource | undefined> {
        let iData = await bedesQuery.definitionSource.getRecordByName(name);
        if (iData) {
            return new BedesDefinitionSource(iData);
        }
        else {
            return undefined;
        }
    }

}