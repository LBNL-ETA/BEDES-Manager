import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { AppTermListOption } from '@bedes-common/models/app-term/app-term-list-option';
import { IAppTermListOption } from '@bedes-common/models/app-term/app-term-list-option.interface';
import { AppTermService } from '../app-term/app-term.service';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTerm } from '@bedes-common/models/app-term/app-term';

@Injectable({
  providedIn: 'root'
})
export class AppTermListOptionService {
    private apiEndpointNew = 'api/app-term/:appTermId/list-option';
    private urlNew: string = null;
    private apiEndpoint = 'api/app-term-list-option';
    private url: string = null;
    // the currently active listOption
    private _activeListOption: AppTermListOption | undefined;
    get activeListOption(): AppTermListOption | undefined {
        return this._activeListOption;
    }
    // BehaviorSubject for the active listOption
    private _activeListOptionSubject: BehaviorSubject<AppTermListOption | undefined>;
    get activeListOptionSubject(): BehaviorSubject<AppTermListOption | undefined> {
        return this._activeListOptionSubject;
    }
    // active AppTerm
    private activeTerm: AppTerm | AppTermList | undefined;

    constructor(
        private http: HttpClient,
        private termService: AppTermService,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
        this.urlNew = `${this.apiUrl}${this.apiEndpointNew}`;
        this._activeListOptionSubject= new BehaviorSubject<AppTermListOption | undefined>(undefined);
        // keep track of the latest appTerm
        this.termService.activeTermSubject
            .subscribe((appTerm: AppTerm | AppTermList) => {
                // set the active AppTerm
                this.activeTerm = appTerm;
            });
    }

    /**
     * Set's the active listOption to the listOption parameter.
     */
    public setActiveListOption(listOption: AppTermListOption): void {
        this._activeListOption = listOption;
        this._activeListOptionSubject.next(this._activeListOption);
    }

    /**
     * Save a new list option to the database.
     */
    public newListOption(appTermList: AppTermList, newListOption: AppTermListOption): Observable<AppTermListOption> {
        // make sure an appTerm id exists
        if (!appTermList.id) {
            throw new Error("Can't create a new listOption on a new AppTermList, list must be saved first.");
        }
        // get the url for the term
        const url = this.buildNewListOptionUrl(appTermList.id);
        return this.http.post<IAppTermListOption>(url, newListOption, { withCredentials: true })
        .pipe(
            map((newOption: IAppTermListOption) => {
                const newListOption = new AppTermListOption(newOption);
                appTermList.listOptions.push(newListOption);
                return newListOption;
            })
        );
    }

    /**
     * Builds a new url for saving a new list option to the backend database.
     *
     * @param appTermId The id of the parent AppTerm
     * @returns The url to use for the POST request
     */
    private buildNewListOptionUrl(appTermId: number): string {
        return this.urlNew.replace(':appTermId', String(appTermId));
    }

    /**
     * Build a url to a specific object, ie a specific object in the database.
     */
    private specificItemUrl(id: number): string {
        return `${this.url}/${id}`;
    }

    /**
     * Delete a specific list option.
     */
    public deleteListOption(appTermList: AppTermList, listOption: AppTermListOption): Observable<any> {
        const listOptionId = listOption.id;
        if (!listOptionId) {
            throw new Error('AppTermListOption missing _id');
        }
        return this.http.delete<any>(this.specificItemUrl(listOptionId), { withCredentials: true })
        .pipe(tap(() => {
            this.listOptionRemovedCleanup(appTermList, listOption);
        }));
    }

    /**
     * Refresh the activeTerm's list options if once has been removed.
     */
    private listOptionRemovedCleanup(appTermList: AppTermList, listOption: AppTermListOption): void {
        if (listOption && appTermList) {
            const index = appTermList.listOptions.findIndex((item) => item === listOption);
            if (index >= 0) {
                // remove the list option from the array
                appTermList.listOptions.splice(index, 1);
            }
            else {
                throw new Error('Unable to remove the listOption from the given AppTermList');
            }
        }
    }

    /**
     * Updates an existing AppTermListOption object.
     */
    public updateListOption(appTermList: AppTermList, listOption: AppTermListOption): Observable<AppTermListOption> {
        if (!listOption.id) {
            throw new Error(`Can't save ListOption without an id`);
        }
        const url = this.specificItemUrl(listOption.id);
        return this.http.put<IAppTermListOption>(url, listOption.toInterface(), { withCredentials: true })
        .pipe(
            map((updatedOption: IAppTermListOption) => {
                // this.updateListOptionCleanup(appTermList, listOption);
                return new AppTermListOption(updatedOption);
            })
        );
    }

    /**
     * Clean up the appTermList after a list has been updated.
     */
    private updateListOptionCleanup(appTermList: AppTermList, listOption: AppTermListOption): void {

    }
}
