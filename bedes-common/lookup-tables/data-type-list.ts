import * as base from './base';

const params = new Array<base.ILookupTableItem>();
params.push({_id: 1, _name: 'Constrained List', _description: undefined});
params.push({_id: 2, _name: 'Decimal', _description: undefined});
params.push({_id: 3, _name: 'Integer', _description: undefined});
params.push({_id: 4, _name: 'String', _description: undefined});
params.push({_id: 5, _name: 'TimeStamp', _description: undefined});

const dataTypeList = new base.LookupTable(params);
export {
    dataTypeList
}
