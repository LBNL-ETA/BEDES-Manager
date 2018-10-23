require('module-alias/register');
import { MappingsLoader } from './mappings-loader';

const mappingLoader = new MappingsLoader();
mappingLoader.run();
