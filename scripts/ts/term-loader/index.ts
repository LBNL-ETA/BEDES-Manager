require('module-alias/register');
import { TermLoader } from './term-loader';

const filePath = '../../bedes-mappings';
const fileName = 'BEDES V2.1_0.xlsx';

const termLoader = new TermLoader(filePath, fileName);
termLoader.run();