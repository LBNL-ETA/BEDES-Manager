import {LookupTableItem, LookupTable} from '@bedes-common/lookup-tables/base';
import {CurrentUser} from '@bedes-common/models/current-user';
import {MappingApplication} from '@bedes-common/models/mapping-application';
import {ApplicationScope} from '@bedes-common/enums/application-scope.enum';

export class FilteredApplicationScopeList {
    private _items: Array<LookupTableItem>;
    get items(): Array<LookupTableItem> {
        return this._items;
    }

    /** currentUser */
    private _currentUser: CurrentUser | undefined;
    get currentUser(): CurrentUser | undefined {
        return this._currentUser;
    }

    set currentUser(value: CurrentUser | undefined) {
        this._currentUser = value;
    }

    /** mappingApplication */
    private _mappingApplication: MappingApplication | undefined;
    get mappingApplication(): MappingApplication | undefined {
        return this._mappingApplication;
    }

    set mappingApplication(value: MappingApplication | undefined) {
        this._mappingApplication = value;
    }

    constructor(
        private scopeList: LookupTable,
        currentUser?: CurrentUser,
        mappingApplication?: MappingApplication
    ) {
        this._currentUser = currentUser;
        this._mappingApplication = mappingApplication;
    }

    /**
     * Determines if all the data required to generate lists are present.
     */
    private hasAllData(): boolean {
        return !!(this._currentUser && this._mappingApplication);
    }

    public updateScopeList(): void {
        if (!this.hasAllData()) {
            this.setListItems([]);
        } else if (this.mappingApplication.isApproved()) {
            // list consists only of the Approved item,
            // ie can't change back to another status
            this.setListItems(
                this.scopeList.items.filter(item => item.id === ApplicationScope.Approved)
            );
        } else if (this.currentUser.isAdmin()) {
            // for scopes of private/public
            // admins are the only ones who can approve composite terms
            this.setListItems(this.scopeList.items);
        } else {
            // for scope of private/public
            // non-admins can't approve composite terms
            this.setListItems(
                this.scopeList.items.filter(item => item.id !== ApplicationScope.Approved)
            );
        }
    }

    /**
     * Updates the items displayed in the select list
     * based on the CurrentUser user group and MappingApplication status
     */
    private setListItems(items: Array<LookupTableItem>): void {
        this._items = items;
    }
}
