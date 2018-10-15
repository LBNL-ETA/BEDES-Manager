import { BedesDataType } from "../../../../bedes-common/bedes-data-type";
import { bedesQuery } from "../../queries";
import { logger } from "../../../../bedes-backend/src/logging";
import * as util from 'util';

/**
 * 
 */
export class BedesDataTypeManager {
    private items: Array<BedesDataType>;

    constructor() {
        this.items = new Array<BedesDataType>();
    }

    /**
     * Gets a BedesDataType by name.
     * @param name 
     * @returns item by name 
     */
    public getItemByName(name: string): BedesDataType | undefined {
        return this.items.find((d) => d.name === name);
    }

    /**
     * Returns an existing BedesDataType object,
     * or creates a new entry for the given unit name in the database,
     * and returns the newly created object.
     * @param name 
     * @returns item or create 
     */
    public async getOrCreateItem(name: string): Promise<BedesDataType | undefined> {
        // make sure there's a name passed in
        if (!name) {
            throw new Error('Invalid parameters.');
        }
        let item: BedesDataType | undefined;
        // first try and find an existing BedesDataType
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
                // add the object to the local cache
                this.items.push(item);
                return item;
            }
        }
        catch (error) {
        }
        // no record found, so create the record in the db
        // create the new BedesDataType if it doesn't exist in the db
        let iDataType = await bedesQuery.dataType.newRecord({ _id: undefined, _name: name });
        let dataType = new BedesDataType(iDataType);
        this.items.push(dataType);
        return dataType;
    }

    public async getDbItemByName(name: string): Promise<any> {
        let iitem = await bedesQuery.dataType.getRecordByName(name);
        return new BedesDataType(iitem);
    }

}