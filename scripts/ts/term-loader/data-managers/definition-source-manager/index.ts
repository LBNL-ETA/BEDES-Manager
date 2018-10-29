import { BedesDefinitionSource, IBedesDefinitionSource } from "@bedes-common/bedes-definition-source";
import { bedesQuery } from "@script-common/queries";
import { GenericDataManager } from "../generic-data-manager";
import { createLogger } from '@script-common/logging';
const logger = createLogger(module);
import * as util from 'util';

/**
 * Bedes data type manager.
 */
export class BedesDefinitionSourceManager extends GenericDataManager<BedesDefinitionSource> {
    constructor() {
        super();
    }

    public async createNewRecord(name: string): Promise<BedesDefinitionSource> {
        try {
            let iData = await bedesQuery.definitionSource.newRecord({_id: undefined, _name: name});
            return new BedesDefinitionSource(iData);
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in createNewRecord`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

    public async getRecordFromDatabase(name: string): Promise<BedesDefinitionSource | undefined> {
        let iData: IBedesDefinitionSource;
        try {
            iData = await bedesQuery.definitionSource.getRecordByName(name);
            return new BedesDefinitionSource(iData);
        } catch (error) {
            // the record doesn't exist in the database
            // ignore and return undefined
            return undefined;
        }
    }

}