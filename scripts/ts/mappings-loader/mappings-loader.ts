import * as util from 'util';
import { createLogger }  from '@script-common/logging';
const logger = createLogger(module);

import { mappers } from './mappings';

export class MappingsLoader {
    constructor() {
    }

    /**
     * Run the mapping loader for each of the defined applications.
     * See mappers array from './mappings/index.ts'
     */
    public async run(): Promise<any> {
        logger.debug(util.inspect(mappers))
        try {
            for (let app of mappers) {
                await app.run();
            }
        }
        catch (error) {
            logger.error('An error occured mapping Bedes applicatoin');
            logger.error(util.inspect(error));
        }
    }

}