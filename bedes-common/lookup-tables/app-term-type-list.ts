import * as base from './base';

const params = new Array<base.ILookupTableItem>();
params.push({_id: 1, _name: '[Value]', _description: undefined});
params.push({_id: 2, _name: 'Constrained List', _description: undefined});

const appTermTypeList = new base.LookupTable(params);
export {
    appTermTypeList
}
