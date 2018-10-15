import { BedesDefinitionSource } from "../../../../bedes-common/bedes-definition-source";
import { bedesQuery } from "../../queries";
import { logger } from "../../../../bedes-backend/src/logging";
import * as util from 'util';

/**
 * Bedes data type manager.
 */
export class BedesDefinitionSourceManager {
    private items: Array<BedesDefinitionSource>;

    constructor() {
        this.items = new Array<BedesDefinitionSource>();
    }

    /**
     * Gets a BedesDefinitionSource by name.
     * @param name 
     * @returns item by name 
     */
    public getItemByName(name: string): BedesDefinitionSource | undefined {
        return this.items.find((d) => d.name === name);
    }

    /**
     * Returns an existing BedesDefinitionSource object,
     * or creates a new entry for the given unit name in the database,
     * and returns the newly created object.
     * @param name 
     * @returns item or create 
     */
    public async getOrCreateItem(name: string): Promise<BedesDefinitionSource | undefined> {
        // make sure there's a name passed in
        if (!name) {
            throw new Error('Invalid parameters.');
        }
        let item: BedesDefinitionSource | undefined;
        // first try and find an existing BedesDefinitionSource
        // resolve it if one exists
        item = this.getItemByName(name);
        if (item) {
            // resolve the promise and exit if found
            return item;
        }
        // next check if the data is in the database
        try {
            item = await this.getDbItemByName(name);
            if (item) {
                logger.debug('found record');
                logger.debug(util.inspect(item));
                return item;
            }
        }
        catch {
        }
        // no record found, so create the record in the db
        // create the new BedesDefinitionSource if it doesn't exist in the db
        let iItem = await bedesQuery.definitionSource.newRecord({_id: undefined, _name: name});
        let definitionSource = new BedesDefinitionSource(iItem);
        this.items.push(definitionSource);
        return definitionSource;
    }

    public async getDbItemByName(name: string): Promise<any> {
            let iitem = await bedesQuery.definitionSource.getRecordByName(name);
            return new BedesDefinitionSource(iitem);
    }

}