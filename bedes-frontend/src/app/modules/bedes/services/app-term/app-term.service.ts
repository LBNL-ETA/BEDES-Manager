import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AppTerm, AppTermList, IAppTerm, IAppTermList } from '@bedes-common/models/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { throwError } from 'rxjs';

/** Transforms IAppTerm and IAppTermList objects into AppTerm | AppTermList objects. */
export const appTermTransformer = (item: IAppTerm | IAppTermList): AppTerm | AppTermList =>{
    if (item._termTypeId === TermType.Atomic) {
        return new AppTerm(item);
    }
    else if(item._termTypeId === TermType.ConstrainedList) {
        return new AppTermList(<IAppTermList>item);
    }
    else {
        throw new Error(`Invalid TypeType (${item._termTypeId})`);
    }
}

@Injectable({
    providedIn: 'root'
})
export class AppTermService {
    public static createNewAppTerm(): AppTerm {
        return new AppTerm({
            _name: 'New Application Term',
            _termTypeId: TermType.Atomic,
            _dataTypeId: null
        });
    }

    /** api endpoint for the AppTerm|AppTermList objects. */
    private apiEndpointTerm = 'api/mapping-application/:appId/term/:termId';
    private urlTerm: string;
    /** api endoing for retrieving the list of AppTerm objects from a sibling id. */
    private apiEndpointSibling = 'api/mapping-application/sibling/:termId';
    private urlSibling: string;
    /** api endpoint for uploading csv file for template definitions. */
    private apiEndpointUpload = 'api/mapping-application/:appId/import';
    private urlUpload: string;
    /** api endpoint for downloading csv files */
    private apiEndpointDownload = 'api/mapping-application/:appId/export';
    private urlDownload: string;
    /** the id of the active MappingApplication */
    private _activeAppId: number | undefined;
    get activeAppId(): number | undefined {
        return this._activeAppId;
    }
    /** indicates if the term list needs to be reloaded */
    public termListNeedsRefresh = false;
    /** the list of AppTerms for the active MappingApplication */
    private termList: Array<AppTerm | AppTermList> | undefined;
    /** the BehaviorSubject for the active AppTerm list */
    private _termListSubject: BehaviorSubject<Array<AppTerm | AppTermList> | undefined>
    get termListSubject(): BehaviorSubject<Array<AppTerm | AppTermList> | undefined> {
        return this._termListSubject;
    }
    /** The selected AppTerm/AppTermList */
    private _activeTerm: AppTerm | AppTermList | undefined;
    get activeTerm(): AppTerm | AppTermList | undefined {
        return this._activeTerm;
    }
    /** BehaviorSubject for the current activeTerm */
    private _activeTermSubject: BehaviorSubject<AppTerm | AppTermList | undefined>;
    get activeTermSubject(): BehaviorSubject<AppTerm | AppTermList | undefined> {
        return this._activeTermSubject;
    }

    /**
     * Set the active AppTerm and call next() on the BehaviorSubject.
     */
    public setActiveTerm(appTerm: AppTerm | AppTermList | undefined): void {
        // set the active term
        this._activeTerm = appTerm;
        // call next() on the BehaviorSubject
        this._activeTermSubject.next(appTerm);
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl: string
    ) {
        this.urlTerm = `${this.apiUrl}${this.apiEndpointTerm}`;
        this.urlSibling = `${this.apiUrl}${this.apiEndpointSibling}`;
        this.urlUpload = `${this.apiUrl}${this.apiEndpointUpload}`;
        this.urlDownload = `${this.apiUrl}${this.apiEndpointDownload}`;
        this._termListSubject = new BehaviorSubject<Array<AppTerm | AppTermList> | undefined>([]);
        this._activeTermSubject = new BehaviorSubject<AppTerm | AppTermList | undefined>(undefined);
    }

    /**
     * Get the AppTerm objects for the given application id.
     */
    public getAppTerms(appId: number): Observable<Array<AppTerm | AppTermList>> {
        const url = this.urlTerm.replace(':appId/term/:termId', `${String(appId)}/term`);
        return this.http.get<Array<IAppTerm | IAppTermList>>(url, { withCredentials: true })
            .pipe(
                map((results: Array<IAppTerm | IAppTermList>) => {
                    this.termListNeedsRefresh = false;
                    return results.map(appTermTransformer);
                }));
    }

    /**
     * Loads all of the sibling AppTerms, as well as the source AppTerm itself,
     * for the appTermId parameter.
     * Used to set the initial state of the AppTermList when a route for a specific
     * AppTerm is navigated to directly.
     */
    public getAppTermSiblings(uuid: string): Observable<Array<AppTerm | AppTermList>> {
        const url = this.urlSibling.replace(':termId', String(uuid));
        return this.http.get<Array<IAppTerm | IAppTermList>>(url, { withCredentials: true })
            .pipe(
                map((results: Array<IAppTerm | IAppTermList>) => {
                    // convert IAppTerm to AppTerm objects (or AppTermList).
                    return results.map(appTermTransformer);
                })
            );

    }

    public getActiveTermList(): Array<AppTerm | AppTermList> {
        return this.termList ? [...this.termList] : [];
    }

    /**
     * Calls `next()` on the active AppTerm and AppTermList
     * Behavior subjects to update views.
     */
    public refreshActiveTerms(): void {
        this._activeTermSubject.next(this._activeTerm);
        this._termListSubject.next(this.termList);
    }

    /**
     * Find an AppTerm in the active list of AppTerms by uuid.
     * Return an undefined if not found.
     */
    public findTermInList(uuid: string): AppTerm | AppTermList | undefined {
        return this.termList
            ? this.termList.find((item) => item.uuid === uuid)
            : undefined;
    }

    /**
     * Set the active MappingApplication.
     */
    public setActiveMappingApplication(appId: number, termList: Array<AppTerm | AppTermList>): void {
        this._activeAppId = appId;
        this.termList = termList;
        this._termListSubject.next(termList);
    }

    /**
     * Calls the backend API to save the new appTerm, and link it to the
     * MappingApplication's appId.
     *
     * @param appId The id of the MappingApplicatoin the AppTerm belongs to.
     * @param appTerm The new AppTerm to be saved.
     * @returns The new AppTerm object just saved to the database.
     */
    public newAppTerm(appId: number, appTerm: AppTerm): Observable<AppTerm | AppTermList> {
        // create the url
        const url = this.getAppTermUrl(appId);
        return this.http.post<IAppTerm | IAppTermList>(url, appTerm, { withCredentials: true })
        .pipe(
            map((results: IAppTerm | IAppTermList) => {
                if(results._termTypeId === TermType.Atomic) {
                   return new AppTerm(results);
                }
                else if(results._termTypeId === TermType.ConstrainedList) {
                    return new AppTermList(results);
                }
                else {
                    throw new Error(`Invalid TermType encountered`);
                }
            })
        );
    }

    /**
     * Updates an existing AppTerm object.
     * @param appId
     * @param appTerm
     * @returns app term
     */
    public updateAppTerm(appId: number, appTerm: AppTerm): Observable<AppTerm> {
        // make sure an id is present on the object
        if(!appId || !appTerm || !appTerm.id) {
            throw new Error('Invalid AppTerm object, an existing object was expected.');
        }
        // create the url
        const url = this.getAppTermUrl(appId, appTerm.id);
        return this.http.put<IAppTerm>(url, appTerm, { withCredentials: true })
        .pipe(
            map((results: IAppTerm) => {
                // create the new class object from the interface
                // add it to the current applications term list
                // pass on the newTerm
                const newTerm = new AppTerm(results);
                return newTerm;
            })
        );
    }

    /**
     * Remove an AppTerm object record from the database.
     *
     * @param  appTerm The AppTerm to remove.
     * @returns The number of records removed.
     */
    public removeTerm(appId: number, appTerm: AppTerm | AppTermList): Observable<number> {
        if(!appId || !appTerm) {
            throw new Error('Invalid AppTerm object, an existing object was expected.');
        }
        if (appTerm.id) {
            // id's there so remove the record from the database
            return this.removeExistingTerm(appId, appTerm);
        }
        else {
            // if there's no id it's not in the database
            // only remove it from the view
            return this.removeNewTerm(appTerm);
        }
    }

    /**
     * Removes an existing AppTerm from the database.
     * @param appId The id of the MappingApplication that the AppTerm belongs to.
     * @param appTerm
     * @returns existing term
     */
    public removeExistingTerm(appId: number, appTerm: AppTerm | AppTermList): Observable<number> {
        if(!appId || !appTerm || !appTerm.id) {
            throw new Error('Invalid AppTerm object, an existing object was expected.');
        }
        // create the url
        const url = this.getAppTermUrl(appId, appTerm.id);
        // call the api to remove the record
        return this.http.delete<number>(url, { withCredentials: true })
            .pipe(
                tap((numRemoved: number) => {
                    if (numRemoved) {
                        // update the appTerm list
                        this.appTermRecordRemoved(appTerm);
                    }
                })
            );
    }

    /**
     * Removes a "new" AppTerm from the termList, ie does not call the
     * backend to remove the object from the database, only the frontend
     * views are updated.
     * @param appTerm The new AppTerm object to remove from the application.
     * @returns The number of objects removed.
     */
    public removeNewTerm(appTerm: AppTerm): Observable<number> {
        if (!appTerm) {
            throw new Error(`Can't remove an undefined AppTerm.`);
        }
        else if (!this.termList) {
            throw new Error(`termList not defined.`);
        }
        else if (!this.termList.includes(appTerm)) {
            throw new Error(`AppTerm not in the termList.`);
        }
        this.appTermRecordRemoved(appTerm);
        return of(1);
    }

    /**
     * Refresh the AppTerm list after an AppTerm has been removed from the backend.
     *
     * @param  appTerm The AppTerm object that was removed from the database.
     */
    private appTermRecordRemoved(appTerm: AppTerm): void {
        // remove the object from the list
        this.removeAppTermFromList(appTerm);
        // reset the activeTerm if it's the same object as the deleted object.
        if (this.activeTerm === appTerm) {
            this.setActiveTerm(undefined);
        }
    }

    /**
     * Builds a url for the given appId and optional termId.
     *
     */
    private getAppTermUrl(appId: number, termId?: number): string {
        if (termId) {
            return this.urlTerm
                .replace(':appId', String(appId))
                .replace(':termId', String(termId));
        }
        else {
            return this.urlTerm
                .replace(':appId', String(appId))
                .replace('/:termId', '');
        }
    }

    /**
     */
    /**
     * Add a new AppTerm to the AppTerm list.
     * Call the BehaviorSubject.next method to broadcast
     * the new list.
     * @param appTerm The AppTerm to add to the list.
     * @param [addToFront] Indicates where to add the object: the front or back of the list.
     * Default is `addToFront=false`, so a new AppTerm is put at the end of the list by default.
     */
    public addAppTermToList(appTerm: AppTerm | AppTermList, addToFront=false): void {
        if (this.termList) {
            // don't include the same object
            if (!this.termList.includes(appTerm)) {
                if (!addToFront) {
                    // add the object to the end of the list
                    this.termList.push(appTerm);
                }
                else {
                    // put the object at the front of the list
                    this.termList.splice(0, 0, appTerm);
                }
            }
            // notify subscribers of the list change
            this.termListSubject.next(this.termList);
        }
        else {
            throw new Error('Unable to add an AppTerm to an undefined termList');
        }
    }

    /**
     * Removes an AppTerm from the current list of AppTerms.
     *
     * @param appTerm The AppTerm|AppTermList object to remove.
     */
    private removeAppTermFromList(appTerm: AppTerm | AppTermList): void {
        if (this.termList) {
            const index = this.termList.indexOf(appTerm);
            if (index >= 0) {
                this.termList.splice(index, 1);
                this.termListSubject.next(this.termList);
            }
        }
    }

    /**
     * Sends a csv file with AppTerm and AppTermList definitions,
     * and returns them as AppTerm | AppTermList objects
     * @param file
     * @returns An array of AppTerm | AppTermList objects
     */
    public uploadAppTerms(appId: number, file: any): Observable<Array<AppTerm | AppTermList>> {
        const formData = new FormData();
        formData.append('appTermImport', file);
        const url = this.getUploadUrl(appId);
        return this.http.post<Array<IAppTerm | IAppTermList>>(url, formData, {withCredentials: true})
        .pipe(
            map((results: Array<IAppTerm | IAppTermList>) => {
                const appTerms = results.map(appTermTransformer);
                // appTerms.forEach(item => this.addAppTermToList(item, true));
                for (let index = appTerms.length - 1; index >= 0; index--) {
                    this.addAppTermToList(appTerms[index], true);
                }
                return appTerms;
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(error.error || "Server error");
    }

    /**
     * Downloads a csv file with appTerm mappings,
     * @param appId
     * @returns comma separated string
     */
    public downloadAppTerms(appId: number): Observable<string> {
        const url = this.getDownloadUrl(appId);
        return this.http.get<string>(url, {withCredentials: true})
    }

    /**
     * Returns the url for uploading a csv file of AppTerm definitions
     * for a specific MappingApplication.
     * @param appId
     * @returns upload url
     */
    private getUploadUrl(appId: number): string {
        return this.urlUpload.replace(':appId', String(appId));
    }

    /**
     * Returns the url for downloading a csv file of AppTerm definitions
     * for a specific MappingApplication.
     * @param appId
     * @returns upload url
     */
    private getDownloadUrl(appId: number): string {
        return this.urlDownload.replace(':appId', String(appId));
    }
}
