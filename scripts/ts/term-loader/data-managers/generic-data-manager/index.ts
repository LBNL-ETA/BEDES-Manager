import { IHasNameProperty } from '@bedes-common/interfaces/has-name-property';
import { createLogger }  from '../../logging';
const logger = createLogger(module);

/**
 * Bedes data type manager.
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
    }

}
