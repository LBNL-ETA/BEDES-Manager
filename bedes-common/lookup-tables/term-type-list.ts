import * as base from './base';

const params = new Array<base.ILookupTableItem>();
params.push({_id: 1, _name: 'Global', _description: undefined});
params.push({_id: 2, _name: 'Premises', _description: undefined});
params.push({_id: 3, _name: 'Contact', _description: undefined});
params.push({_id: 4, _name: 'Measures', _description: undefined});
params.push({_id: 5, _name: 'Envelope', _description: undefined});
params.push({_id: 6, _name: 'HVAC', _description: undefined});
params.push({_id: 7, _name: 'Loads', _description: undefined});
params.push({_id: 8, _name: 'Controls And Operation', _description: undefined});
params.push({_id: 9, _name: 'Generation And StorageEquipment', _description: undefined});
params.push({_id: 11, _name: 'Resources', _description: undefined});
params.push({_id: 12, _name: 'Emissions', _description: undefined});
params.push({_id: 13, _name: 'Waste', _description: undefined});

const termTypeList = new base.LookupTable(params);
export {
    termTypeList
}
