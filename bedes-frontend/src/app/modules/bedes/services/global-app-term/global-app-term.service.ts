import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {AppTerm, AppTermList, IAppTerm, IAppTermList} from '@bedes-common/models/app-term';
import {HttpClient, HttpParams} from '@angular/common/http';
import {API_URL_TOKEN} from '../url/url.service';
import {appTermTransformer} from '../app-term/app-term.service';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GlobalAppTermService {

    private apiEndpointTerms = 'api/application-term';
    private urlTerms;
    private appTermList = new Array<AppTerm | AppTermList>();
    private _appTermListSubject = new BehaviorSubject<Array<AppTerm | AppTermList>>([]);

    /* Whether the API request should include terms with Scope = Scope.Public */
    private _includePublicTerms: boolean;
    private _includePublicTermsSubject = new Subject<boolean>();

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl: string,
    ) {
        this.urlTerms = `${this.apiUrl}${this.apiEndpointTerms}`;
    }

    get appTermListSubject(): BehaviorSubject<Array<AppTerm | AppTermList> | undefined> {
        return this._appTermListSubject;
    }

    get includePublicTermsSubject() {
        return this._includePublicTermsSubject;
    }

    get includePublicTerms() {
        return this._includePublicTerms;
    }

    set includePublicTerms(value) {
        this._includePublicTerms = value;
        this._includePublicTermsSubject.next(this._includePublicTerms);
    }

    public load() {
        this.getAll().subscribe(
            (appTerms: Array<AppTerm | AppTermList>) => {
                this.appTermList = appTerms;
                this.appTermListSubject.next(this.appTermList);
            },
            (error: any) => {
                throw error;
            }
        );
    }

    /**
     * Get all of the BEDES app terms from the API.
     */
    public getAll(): Observable<Array<AppTerm | AppTermList>> {
        const requestParams = new HttpParams().set('includePublic', this.getIncludePublicQueryParam());
        return this.http.get<Array<IAppTerm | IAppTermList>>(this.urlTerms, {withCredentials: true, params: requestParams})
            .pipe(map((results: Array<IAppTerm | IAppTermList>) => results.map(appTermTransformer)));
    }

    private getIncludePublicQueryParam(): string {
        return this._includePublicTerms ? '1' : '0';
    }

}
