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
export class AppTermListService {
    // api endpoint for the MappingApplication objects.
    private apiEndpoint = 'api/mapping-application/:id/term';
    private url: string = null;
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
    private _activeTermSubject: BehaviorSubject<AppTerm | AppTermList | undefined>;
    get activeTerm(): AppTerm | AppTermList | undefined {
        return this._activeTerm;
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
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
        this._termListSubject = new BehaviorSubject<Array<AppTerm | AppTermList>>([]);
        this._activeTermSubject = new BehaviorSubject<AppTerm | AppTermList | undefined>(undefined);
    }

    /**
     * Get the AppTerm objects for the given application id.
     */
    public getAppTerms(appId: number): Observable<Array<AppTerm | AppTermList>> {
        const url = this.url.replace(':id', String(appId));
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
     * Retrieve a specific appTerm by id|uuid.
     */
    public getAppTerm(appTermId: number): Observable<AppTerm | AppTermList> {
        const url = this.url.replace(':id', String(appTermId));
        return this.http.get<IAppTerm | IAppTermList>(url, { withCredentials: true })
            .pipe(
                map((item: IAppTerm | IAppTermList) => {
                    console.log(`${this.constructor.name}: received results`, item);
                    // convert IAppTerm to AppTerm (or AppTermList).
                    if (item._termTypeId === TermType.Atomic) {
                        return new AppTerm(item);
                    }
                    else if(item._termTypeId === TermType.ConstrainedList) {
                        return new AppTermList(<IAppTermList>item);
                    }
                    else {
                        throw new Error(`Invalid TypeType (${item._termTypeId})`);
                    }
                })
            );

    }

    public getActiveTermList(): Array<AppTerm | AppTermList> {
        return this.termList ? [...this.termList] : [];
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
