import * as base from './base';

const params = new Array<base.ILookupTableItem>();
params.push({_id: 1, _name: 'Pending', _description: undefined});
params.push({_id: 2, _name: 'Approved', _description: undefined});
params.push({_id: 3, _name: 'Rejected', _description: undefined});

/** * List of the possible request status states. */
export const promoteRequestStatusList = new base.LookupTable(params);
