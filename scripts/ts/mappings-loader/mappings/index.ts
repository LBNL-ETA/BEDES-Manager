import path from 'path';
import { BedesMappingBase } from './base/mappings-base';
import { HpxmlLoader } from './HPXML';

const mappers = new Array<BedesMappingBase>();
mappers.push(new HpxmlLoader(path.join(__dirname, '../../../../bedes-mappings'), 'BPI-2200-S HPXML to BEDES V2 Mapping 20161026_0.xls'));

export {
    BedesMappingBase,
    mappers
}
