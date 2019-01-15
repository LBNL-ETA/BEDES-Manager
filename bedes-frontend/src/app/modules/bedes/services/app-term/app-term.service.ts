import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppTerm, AppTermList, IAppTerm, IAppTermList } from '@bedes-common/models/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';

@Injectable({
    providedIn: 'root'
})
export class AppTermService {
    // api endpoint for the AppTerm|AppTermList objects.
    private apiEndpointTerm = 'api/mapping-application/:appId/term/:termId';
    private urlTerm: string = null;
    // api endoing for retrieving the list of AppTerm objects from a sibling id.
    private apiEndpointSibling = 'api/mapping-application/sibling/:termId';
    private urlSibling: string = null;
    // the id of the active MappingApplication
    private _activeAppId: number | undefined;
    get activeAppId(): number | undefined {
        return this._activeAppId;
    }
    // the list of AppTerms for the active MappingApplication
    private termList: Array<AppTerm | AppTermList>;
    // the BehaviorSubject for the active AppTerm list
    private _termListSubject: BehaviorSubject<Array<AppTerm | AppTermList>>
    get termListSubject(): BehaviorSubject<Array<AppTerm | AppTermList>> {
        return this._termListSubject;
    }
    // The selected AppTerm/AppTermList
    private _activeTerm: AppTerm | AppTermList | undefined;
    get activeTerm(): AppTerm | AppTermList | undefined {
        return this._activeTerm;
    }
    // BehaviorSubject for the current activeTerm
    private _activeTermSubject: BehaviorSubject<AppTerm | AppTermList | undefined>;
    get activeTermSubject(): BehaviorSubject<AppTerm | AppTermList> {
        return this._activeTermSubject;
    }

    /**
     * Set the active AppTerm and call next() on the BehaviorSubject.
     */
    public setActiveTerm(appTerm: AppTerm | AppTermList): void {
        this._activeTerm = appTerm;
        this._activeTermSubject.next(appTerm);
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.urlTerm = `${this.apiUrl}${this.apiEndpointTerm}`;
        this.urlSibling = `${this.apiUrl}${this.apiEndpointSibling}`;
        this._termListSubject = new BehaviorSubject<Array<AppTerm | AppTermList>>([]);
        this._activeTermSubject = new BehaviorSubject<AppTerm | AppTermList | undefined>(undefined);
    }

    /**
     * Get the AppTerm objects for the given application id.
     */
    public getAppTerms(appId: number): Observable<Array<AppTerm | AppTermList>> {
        const url = this.urlTerm.replace(':appId/term/:termId', `${String(appId)}/term`);
        console.log('get app terms', url);
        return this.http.get<Array<IAppTerm | IAppTermList>>(url, { withCredentials: true })
            .pipe(
                map((results: Array<IAppTerm | IAppTermList>) => {
                    console.log(`${this.constructor.name}: received results`, results);
                    // convert IAppTerm to AppTerm objects (or AppTermList).
                    return results.map((item: IAppTerm | IAppTermList) =>{
                        if (item._termTypeId === TermType.Atomic) {
                            return new AppTerm(item);
                        }
                        else if(item._termTypeId === TermType.ConstrainedList) {
                            return new AppTermList(<IAppTermList>item);
                        }
                        else {
                            throw new Error(`Invalid TypeType (${item._termTypeId})`);
                        }
                    });
                })
            );
    }

    /**
     * Loads all of the sibling AppTerms, as well as the source AppTerm itself,
     * for the appTermId parameter.
     * Used to set the initial state of the AppTermList when a route for a specific
     * AppTerm is navigated to directly.
     */
    public getAppTermSiblings(appTermId: number): Observable<Array<AppTerm | AppTermList>> {
        const url = this.urlSibling.replace(':termId', String(appTermId));
        return this.http.get<Array<IAppTerm | IAppTermList>>(url, { withCredentials: true })
            .pipe(
                map((results: Array<IAppTerm | IAppTermList>) => {
                    console.log(`${this.constructor.name}: received results`, results);
                    // convert IAppTerm to AppTerm objects (or AppTermList).
                    return results.map((item: IAppTerm | IAppTermList) =>{
                        if (item._termTypeId === TermType.Atomic) {
                            return new AppTerm(item);
                        }
                        else if(item._termTypeId === TermType.ConstrainedList) {
                            return new AppTermList(<IAppTermList>item);
                        }
                        else {
                            throw new Error(`Invalid TypeType (${item._termTypeId})`);
                        }
                    });
                })
            );

    }

    public getActiveTermList(): Array<AppTerm | AppTermList> {
        return this.termList ? [...this.termList] : [];
    }

    /**
     * Find an AppTerm in the active list of AppTerms.
     * Return an undefined if not found.
     */
    public findTermInList(appTermId: number): AppTerm | AppTermList | undefined {
        return this.termList
            ? this.termList.find((d) => d.id === appTermId)
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

    // public newAppTerm(appId: number, appTerm: AppTerm): Observable<MappingApplication> {
    //     return this.http.post<IMappingApplication>(this.url, app, { withCredentials: true })
    //     .pipe(
    //         map((results: IMappingApplication) => {
    //             const newApp = new MappingApplication(results);
    //             this.addAppToList(newApp);
    //             return newApp;
    //         })
    //     );
    // }

    // public updateApplication(app: IMappingApplication): Observable<MappingApplication> {
    //     return this.http.put<IMappingApplication>(this.url, app, { withCredentials: true })
    //     .pipe(
    //         map((results: IMappingApplication) => {
    //             const newApp = new MappingApplication(results);
    //             return newApp;
    //         })
    //     );
    // }

    /**
     * Add a new AppTerm to the AppTerm list.
     * Call the BehaviorSubject.next method to broadcast
     * the new list.
     */
    private addAppTermToList(appTerm: AppTerm | AppTermList): void {
        this.termList.push(appTerm);
        this.termListSubject.next(this.termList);
    }

}
