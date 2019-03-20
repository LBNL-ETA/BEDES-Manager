require('module-alias/register');
import { TermLoader } from './term-loader';
import * as util from 'util';

const filePath = '../../bedes-mappings';
const fileName = 'BEDES V2.2.xlsx';

const termLoader = new TermLoader(filePath, fileName);
termLoader.run()
    .then((results: any) => {
        console.log('Done loading terms');
        process.exit(0);
    }, (error: Error) => {
        console.log('Error loading terms');
        console.error(util.inspect(error));
        process.exit(1);
    });
