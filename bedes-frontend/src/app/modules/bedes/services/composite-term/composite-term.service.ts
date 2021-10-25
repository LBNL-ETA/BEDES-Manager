import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, BehaviorSubject, Subject} from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BedesCompositeTerm, IBedesCompositeTerm } from '@bedes-common/models/bedes-composite-term';
import { BedesCompositeTermShort, IBedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short';
import { ICompositeTermDetailRequestParam } from '@bedes-common/models/composite-term-detail-request-param';
import { ICompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result';
import { CompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result/composite-term-detail-request-result';
import { CompositeTermDetail } from '@bedes-common/models/bedes-composite-term/composite-term-item/composite-term-detail';
import { CurrentUser } from '@bedes-common/models/current-user';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';

const consoleFormatString = `background-color: dodgerblue; color: white; padding: 5px`;

@Injectable({
    providedIn: 'root'
})
export class CompositeTermService {
    // api endpoint info for savings new terms
    private apiEndpointNew = 'api/composite-term';
    private urlNew: string = null;
    // api endpoint info for updating existing terms
    private apiEndpointUpdate = 'api/composite-term/:id';
    private urlUpdate: string = null;
    // api endpoint info for the composite term detail info requests
    private apiEndpointDetailInfo = 'api/composite-term/detail-info';
    private urlDetailInfo: string = null;
    // api endpoint info for composite-term-detail
    private apiEndpointDetail = 'api/composite-term-detail/:id';
    private urlDetail: string = null;
    // Subject that emits the currently selected CompositeTerm.
    private _selectedTermSubject = new BehaviorSubject<BedesCompositeTerm>(undefined);
    get selectedTermSubject(): BehaviorSubject<BedesCompositeTerm | undefined> {
        return this._selectedTermSubject;
    }
    // stores the currently active composite term
    private _selectedTerm: BedesCompositeTerm | undefined;
    get selectedTerm(): BedesCompositeTerm | undefined {
        return this._selectedTerm;
    }
    // list of terms
    /* Array that holds the list of composite terms */
    private termList: Array<BedesCompositeTermShort>;
    /* BehaviorSubject that emits the current list of composite terms */
    private _termListSubject = new BehaviorSubject<Array<BedesCompositeTermShort>>([]);
    public get termListSubject(): BehaviorSubject<Array<BedesCompositeTermShort>> {
        return this._termListSubject;
    }
    /* Whether the API request should include terms with Scope = Scope.Public */
    private _includePublicTerms: boolean;
    public set includePublicTerms(value) {
        this._includePublicTerms = value;
        this._includePublicTermsSubject.next(this._includePublicTerms);
    }
    private _includePublicTermsSubject = new Subject<boolean>();

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl,
        private authService: AuthService
    ) {
        this.urlNew = `${this.apiUrl}${this.apiEndpointNew}`;
        this.urlUpdate = `${this.apiUrl}${this.apiEndpointUpdate}`;
        this.urlDetailInfo = `${this.apiUrl}${this.apiEndpointDetailInfo}`;
        this.urlDetail = `${this.apiUrl}${this.apiEndpointDetail}`;
        this._includePublicTerms = false;
        this.subscribeToCurrentUser();
        this.subscribeToIncludePublicTerms();
    }

    /**
     * Subscribe to changes in authenticated users.
     * Updates the composite term list as a user is logged in/out.
     */
    private subscribeToCurrentUser(): void {
        // subscribe to the authenticated user
        // update the composite term list as the authenticated user changes
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            this.load();
        });
    }

    /**
     * Subscribe to whether we are including public terms or not. This lets us trigger a new query when this
     * changes.
     */
    private subscribeToIncludePublicTerms(): void {
        this._includePublicTermsSubject.subscribe((includePublicTerms: boolean) => {
            this.load();
        });
    }

    /**
     * Load the list of composite terms (short) during initialization.
     */
    public load(): void {
        this.getAll().subscribe(
            (terms: Array<BedesCompositeTermShort>) => {
                this.termList = terms;
                this.termListSubject.next(this.termList);
            },
            (error: any) => {
                throw error;
            }
        );
    }

    /**
     * Get all of the BEDES composite terms from the API.
     */
    public getAll(): Observable<Array<BedesCompositeTermShort>> {
        const requestParams = new HttpParams().set('includePublic', this.getIncludePublicQueryParam());
        return this.http.get<Array<IBedesCompositeTermShort>>(this.urlNew, { withCredentials: true , params: requestParams })
            .pipe(map((results: Array<IBedesCompositeTermShort>) => {
                if (!Array.isArray(results)) {
                    throw new Error(`${this.constructor.name}: getAll expected to receive an array of composite terms`);
                }
                return results.map((item) => new BedesCompositeTermShort(item));
            }));
    }

    private getIncludePublicQueryParam(): string {
        return this._includePublicTerms ? '1' : '0';
    }

    /**
     * Fetch a CompositeTerm from the API
     * @param id
     * @returns term
     */
    public getTerm(uuid: string): Observable<BedesCompositeTerm> {
        const url = this.urlUpdate.replace(/:id$/, uuid);
        return this.http.get<IBedesCompositeTerm>(url, { withCredentials: true })
            .pipe(map((results: IBedesCompositeTerm) => {
                return new BedesCompositeTerm(results);
            }));
    }

    public getCompositeTermDetailRequest(
        queryParams: Array<ICompositeTermDetailRequestParam>
    ): Observable<Array<CompositeTermDetailRequestResult>> {
        const params = {
            queryParams: queryParams
        };
        return this.http.post<Array<ICompositeTermDetailRequestResult>>(this.urlDetailInfo, params, { withCredentials: true })
            .pipe(map((results: Array<ICompositeTermDetailRequestResult>) => {
                // transform the interface into a class object instance
                return results.map((item) => new CompositeTermDetailRequestResult(item));
            }));
    }

    /**
     * Calls the backend to remove the composite term detail record from the composite term.
     */
    public removeCompositeTermDetail(detailItem: CompositeTermDetail): Observable<number> {
        const url = this.urlDetail.replace(/:id$/, String(detailItem.id));
        return this.http.delete<number>(url, { withCredentials: true })
            .pipe(tap((results: any) => {
                // reload the bedes term list
                this.load();
            }));
    }

    /**
     * Saves a new CompositeTerm to the database.
     */
    public saveNewTerm(compositeTerm: BedesCompositeTerm): Observable<BedesCompositeTerm> {
        return this.http.post<IBedesCompositeTerm>(this.urlNew, compositeTerm, {withCredentials: true})
        .pipe(map((results: IBedesCompositeTerm) => {
            // reload the bedes term list
            // this.load();
            const newTerm = new BedesCompositeTerm(results);
            this.addTermToList(BedesCompositeTermShort.fromBedesCompositeTerm(newTerm));
            // need to tell auth to reload authenticated user info
            // authenticated users know what composite terms they can edit
            this.authService.checkLoginStatusPromise();
            return newTerm;
        }));
    }

    /**
     * Update an existing CompositeTerm.
     */
    public updateTerm(compositeTerm: BedesCompositeTerm): Observable<BedesCompositeTerm> {
        if (!compositeTerm.id) {
            throw new Error(`${this.constructor.name}: Attempt to update a new CompositeTerm`)
        }
        const url = this.urlUpdate.replace(/:id$/, String(compositeTerm.id));
        return this.http.put<IBedesCompositeTerm>(url, compositeTerm.toInterface(), {withCredentials: true})
        .pipe(map((results: IBedesCompositeTerm) => {
            const newTerm = new BedesCompositeTerm(results);
            // update the corresponding BedesCompositeTermShort in the ilst
            this.updateExistingListTerm(newTerm);
            return newTerm;
        }));
    }


    /**
     * Removes a composite term from the backend database.
     * @param compositeTerm The BedesCompositeTerm to delete.
     * @returns term
     */
    public deleteTerm(compositeTerm: BedesCompositeTerm | BedesCompositeTermShort): Observable<number> {
        if (!compositeTerm || !compositeTerm.id || !compositeTerm.uuid) {
            throw new Error(`${this.constructor.name}: Attempt to update a new CompositeTerm`)
        }
        const url = this.urlUpdate.replace(/:id$/, String(compositeTerm.uuid));
        return this.http.delete<number>(url, {withCredentials: true})
        .pipe(map((results: number) => {
            this.removeTermFromList(compositeTerm);
            this.authService.checkLoginStatusPromise();
            return results;
        }));
    }

    private addTermToList(term: BedesCompositeTermShort): void {
        // look for term with the same uuid
        const existing = this.termList.find((item) => item.uuid === term.uuid);
        if (existing) {
            throw new Error('Attempted to add a composite term that already exists');
        }
        // add the term to the top of the list
        this.termList.splice(0, 0, term);
        this._termListSubject.next(this.termList);
    }

    /**
     * Updates the existing BedesCompositeTermShort, if the corresponding
     * BedesCompositeTerm has been updated.
     * @param term
     */
    private updateExistingListTerm(term: BedesCompositeTerm): void {
        // find the corresponding term by uuid
        const shortItem = this.termList.find((item) => item.uuid === term.uuid);
        if (!shortItem) {
            throw new Error(`Unable to find corresponding short item ${term.uuid}`)
        }
        // assign the updateable values
        shortItem.id = term.id;
        shortItem.name = term.name;
        shortItem.description = term.description;
        shortItem.signature = term.signature;
        shortItem.unitId = term.unitId;
        shortItem.scopeId = term.scopeId;
        this._termListSubject.next(this.termList);
    }

    /**
     * Remove a CompositeTerm from the termList.
     * @param term
     */
    public removeTermFromList(term: BedesCompositeTerm | BedesCompositeTermShort): void {
        // check requirements
        if (!Array.isArray(this.termList)) {
            throw new Error('Unable to remove term from uninitialized termList');
        }
        else if (!term) {
            throw new Error('removeTermFromList received an empty term');
        }
        // look for the term with matching uuid
        const index = this.termList.findIndex((item) => item.uuid === term.uuid);
        if (index >= 0) {
            // found the term to remove, remove it
            this.termList.splice(index, 1);
            this.termListSubject.next(this.termList);
            // tell auth to reload the authenticated user info
            this.authService.checkLoginStatusPromise();
        }
        else {
            throw new Error('Unable to find the CompositeTerm in the termList');
        }

    }

    /**
     * Set's the active BedesCompositeTerm.
     */
    public setActiveCompositeTerm(term: BedesCompositeTerm): void {
        this._selectedTerm = term;
        this._selectedTermSubject.next(this._selectedTerm);
    }

    /**
     * Create a new CompositeTerm object and set it as the active term.
     *
     * @returns The new BedesCompositeTerm object that was just created and activated.
     */
    public activateNewCompositeTerm(): BedesCompositeTerm {
        // pass a new object to the existing method
        const newTerm = new BedesCompositeTerm();
        this.setActiveCompositeTerm(newTerm);
        return newTerm;
    }

    /**
     * Set's the active composite term to the term with a matching id.
     */
    public setActiveCompositeTermById(id: number): void {
        if (this._selectedTerm && id === this._selectedTerm.id) {
            return;
        }
        const found = this.termList.find((d) => d.id === id)
        if (found) {
            // this.setActiveCompositeTerm(found);
        }
        else {
            throw new Error(`Invalid BedesCompositeTerm.id ${id}`);
        }
    }
}

