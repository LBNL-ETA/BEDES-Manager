require('module-alias/register');
import { XmlTermOptionLoader } from './xml-term-option-loader';
import * as util from 'util';

const filePath = '../../bedes-mappings';
const fileName = 'BEDES_all_list_options_V2-2.xml';

console.log(`load file ${filePath}/${fileName}`)
const termLoader = new XmlTermOptionLoader(filePath, fileName);
termLoader.run()
    .then((results: any) => {
        console.log('Done loading term options');
    }, (error: Error) => {
        console.log('Error loading term options');
        console.error(util.inspect(error));
    });
