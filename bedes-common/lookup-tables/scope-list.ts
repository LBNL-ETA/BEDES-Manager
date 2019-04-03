import * as base from './base';
import { Scope } from '../enums/scope.enum';

const params = new Array<base.ILookupTableItem>();
params.push({
    _id: Scope.Private,
    _name: 'Private - Seen only by you',
    _description: undefined
});
params.push({
    _id: Scope.Public,
    _name: 'Public - Visible to everybody, use limited to private application mappings',
    _description: undefined
});
params.push({
    _id: Scope.Approved,
    _name: 'Approved - Visible to everybody, for use in all applications',
    _description: undefined
});

/** * List of the possible Scope states for application/composite term visibility */
export const scopeList = new base.LookupTable(params);
