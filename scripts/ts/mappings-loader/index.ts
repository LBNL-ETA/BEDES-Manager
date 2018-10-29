require('module-alias/register');
import { MappingsLoader } from './mappings-loader';
import * as util from 'util';

const mappingLoader = new MappingsLoader();
mappingLoader.run().then(
    (results) => {
        console.log('done!');
    },
    (error: Error) => {
        console.log('error running the mapLoader');
        console.log(util.inspect(error));
    }
);
