import { IBedesDataType } from '../models/bedes-data-type';
import { IBedesUnit } from '../models/bedes-unit';
import { IBedesTermCategory } from '../models/bedes-term-category';
import { IBedesDefinitionSource } from '@bedes-common/models/bedes-definition-source';

export interface ISupportList {
    _dataTypeList: Array<IBedesDataType>,
    _unitList: Array<IBedesUnit>,
    _categoryList: Array<IBedesTermCategory>,
    _definitionSourceList: Array<IBedesDefinitionSource>
}
