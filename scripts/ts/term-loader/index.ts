require('module-alias/register');
import { TermLoader } from './term-loader';
import * as util from 'util';

const filePath = '../../bedes-mappings';
const fileName = 'BEDES V2.1_0.xlsx';

const termLoader = new TermLoader(filePath, fileName);
termLoader.run()
.then((results: any) => {
    console.log('Done loading terms');
}, (error: Error) => {
    console.log('Error loading terms');
    console.error(util.inspect(error));
});