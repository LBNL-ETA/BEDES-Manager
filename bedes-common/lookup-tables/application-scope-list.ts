import * as base from './base';
import { Scope } from '../enums/scope.enum';
import { ApplicationScope } from '../enums/application-scope.enum';

const params = new Array<base.ILookupTableItem>();
params.push({
    _id: ApplicationScope.Private,
    _name: 'Private',
    _description: undefined
});
params.push({
    _id: ApplicationScope.Public,
    _name: 'Approved',
    _description: undefined
});

/** * List of the possible Scope states for application visibility */
export const applicationScopeList = new base.LookupTable(params);
