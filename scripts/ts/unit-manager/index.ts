import { BedesUnit } from "../../../bedes-common/bedes-unit";
import { bedesQuery } from "../queries";
import { logger } from "../../../bedes-backend/src/logging";
import * as util from 'util';

/**
 * 
 */
export class BedesUnitManager {
    private items: Array<BedesUnit>;

    constructor() {
        this.items = new Array<BedesUnit>();
    }

    /**
     * Gets a BedesUnit by name.
     * @param name 
     * @returns item by name 
     */
    public getItemByName(name: string): BedesUnit | undefined {
        return this.items.find((d) => d.name === name);
    }

    /**
     * Returns an existing BedesUnit object,
     * or creates a new entry for the given unit name in the database,
     * and returns the newly created object.
     * @param name 
     * @returns item or create 
     */
    public async getOrCreateItem(name: string): Promise<BedesUnit | undefined> {
        // return new Promise((resolve, reject) => {
            // make sure there's a name passed in
            if (!name) {
                throw new Error('Invalid parameters.');
            }
            let item: BedesUnit | undefined;
            // first try and find an existing BedesUnit
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
                // item not in the database
                console.log('error');
                console.log(error);
            }
            // no record found, so create the record in the db
            // create the new BedesUnit if it doesn't exist in the db
            let iitem = await bedesQuery.units.newRecord({_id: undefined, _name: name})
            let bedesUnit = new BedesUnit(iitem);
            this.items.push(bedesUnit);
            return bedesUnit;

        // });
    }

    public async getDbItemByName(unitName: string): Promise<any> {
            let iitem = await bedesQuery.units.getRecordByName(unitName);
            return new BedesUnit(iitem);

            // .then(
            //     (results: BedesUnit) => {
            //         logger.debug('received results from unit query');
            //         logger.debug(util.inspect(results));
            //         resolve(results);
            //     },
            //     (error: Error) => {
            //         logger.error(`Error retrieving BedesUnit by name '${unitName}'`);
            //         logger.error(util.inspect(error));
            //         reject();
            //     }
            // );
    }

}