import { LookupTableItem, LookupTable } from "@bedes-common/lookup-tables/base";
import { CurrentUser } from "@bedes-common/models/current-user";
import { BedesCompositeTerm } from "@bedes-common/models/bedes-composite-term";
import { Scope } from "@bedes-common/enums/scope.enum";

export class FilteredScopeList {
    private _items:  Array<LookupTableItem>;
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
    /** compositeTerm */
    private _compositeTerm: BedesCompositeTerm | undefined;
    get compositeTerm(): BedesCompositeTerm | undefined {
        return this._compositeTerm;
    }
    set compositeTerm(value: BedesCompositeTerm | undefined) {
        this._compositeTerm = value;
    }

    constructor(
        private scopeList: LookupTable,
        currentUser?: CurrentUser,
        compositeTerm?: BedesCompositeTerm
    ) {
        this._currentUser = currentUser;
        this._compositeTerm = compositeTerm;
    }

    /**
     * Determines if all the data required to generate lists are present.
     */
    private hasAllData(): boolean {
        return this._currentUser && this._compositeTerm ? true : false;
    }

    public updateScopeList(): void {
        if (!this.hasAllData()) {
            this.setListItems([]);
        }
        else if (this.compositeTerm.hasApprovedScope()) {
            // list consists only of the Approved item,
            // ie can't change back to another status
            this.setListItems(
                this.scopeList.items.filter(item => item.id === Scope.Approved)
            );
        }
        else if (this.currentUser.isAdmin()) {
            // for scopes of private/public
            // admins are the only ones who can approve composite terms
            this.setListItems(this.scopeList.items);
        }
        else {
            // for scope of private/public
            // non-admins can't approve composite terms
            this.setListItems(
                this.scopeList.items.filter(item => item.id !== Scope.Approved)
            )
        }
    }

    /**
     * Updates the items displayed in the select list
     * based on the CurrentUser user group and CompositeTerm status
     * @param items
     */
    private setListItems(items: Array<LookupTableItem>): void {
        this._items = items;
    }
}
