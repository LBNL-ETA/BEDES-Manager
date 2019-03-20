require('module-alias/register');
import { XmlTermLoader } from './xml-term-loader';
import * as util from 'util';

const filePath = '../../bedes-mappings';
const fileName = 'BEDES_all-terms_V2-2.xml';

console.log(`load file ${filePath}/${fileName}`)
const termLoader = new XmlTermLoader(filePath, fileName);
termLoader.run()
    .then((results: any) => {
        console.log('Done loading terms');
        process.exit(0);
    }, (error: Error) => {
        console.log('Error loading terms');
        console.error(util.inspect(error));
        process.exit(1);
    });
