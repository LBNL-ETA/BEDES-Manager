import * as base from './base';

const params = new Array<base.ILookupTableItem>();
params.push({_id: 1, _name: 'Private', _description: undefined});
params.push({_id: 2, _name: 'Public', _description: undefined});

/** * List of the possible Scope states for application/composite term visibility */
export const scopeList = new base.LookupTable(params);
