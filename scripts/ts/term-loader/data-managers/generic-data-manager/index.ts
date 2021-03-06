import { IHasNameProperty } from '@bedes-common/interfaces/has-name-property';
import { createLogger } from '@script-common/logging';
const logger = createLogger(module);
import * as util from 'util';

/**
 * Generic class for managing the reading/writing of the various Bedes data models.
 */
export abstract class GenericDataManager<T extends IHasNameProperty> {
    protected items: Array<T>;
    public abstract async createNewRecord(name: string): Promise<T>;
    public abstract async getRecordFromDatabase(name: string): Promise<T | undefined>;

    constructor() {
        this.items = new Array<T>();
    }

    /**
     * Gets an object by name.
     * @param name 
     * @returns An object of type T | undefined
     */
    public getRecordFromLocalCache(name: string): T | undefined {
        return this.items.find((d) => d.name === name);
    }

    public async getOrCreateItem(name: string): Promise<T> {
        try {
            // make sure there's a name passed in
            if (!name) {
                throw new Error('Invalid parameters.');
            }
            let item: T | undefined;
            // first try and find an existing T 
            // resolve it if one exists
            item = this.getRecordFromLocalCache(name);
            if (item) {
                // resolve the promise and exit if found
                return item;
            }
            // next check if the data is in the database
            try {
                item = await this.getRecordFromDatabase(name);
                if (item) {
                    this.items.push(item);
                    return item;
                }
            }
            catch {
            }
            // no record found, so create the record in the db
            item = await this.createNewRecord(name);
            this.items.push(item);
            return item;
        } catch (error) {
            logger.error(`${this.constructor.name}: Error in getOrCreateItem('${name}')`);
            logger.error(util.inspect(error));
            throw error;
        }
    }

}
