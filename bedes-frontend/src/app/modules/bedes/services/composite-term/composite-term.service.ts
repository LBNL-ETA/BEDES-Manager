import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BedesCompositeTerm, IBedesCompositeTerm } from '@bedes-common/models/bedes-composite-term';
import { BedesCompositeTermShort, IBedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short';
import { ICompositeTermDetailRequestParam } from '@bedes-common/models/composite-term-detail-request-param';
import { ICompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result';
import { CompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result/composite-term-detail-request-result';
import { CompositeTermDetail } from '@bedes-common/models/bedes-composite-term/composite-term-item/composite-term-detail';

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

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.urlNew = `${this.apiUrl}${this.apiEndpointNew}`;
        this.urlUpdate = `${this.apiUrl}${this.apiEndpointUpdate}`;
        this.urlDetailInfo = `${this.apiUrl}${this.apiEndpointDetailInfo}`;
        this.urlDetail = `${this.apiUrl}${this.apiEndpointDetail}`;
    }

    /**
     * Load the list of composite terms (short) during initialization.
     */
    public load(): Promise<boolean> {
        try {
            console.log(`${this.constructor.name}: retrieving composite term list...`)
            return new Promise((resolve, reject) => {
                this.getAll().subscribe(
                    (terms: Array<BedesCompositeTermShort>) => {
                        console.log(`${this.constructor.name}: received composite term list`, terms);
                        this.termList = terms;
                        this.termListSubject.next(this.termList);
                        resolve(true);
                    },
                    (error: any) => {
                        console.log(`${this.constructor.name}: error retrieving composite term list`);
                        console.log(error);
                        reject(error);
                    }
                );
            });
        }
        catch (error) {
            console.log(`${this.constructor.name}: Error during application load()`, error);
            throw error;
        }
    }

    /**
     * Get all of the BEDES composite terms from the API.
     */
    public getAll(): Observable<Array<BedesCompositeTermShort>> {
        return this.http.get<Array<IBedesCompositeTermShort>>(this.urlNew, { withCredentials: true })
            .pipe(map((results: Array<IBedesCompositeTermShort>) => {
                console.log(`${this.constructor.name}: received results`, results);
                if (!Array.isArray(results)) {
                    throw new Error(`${this.constructor.name}: getAll expected to receive an array of composite terms`);
                }
                return results.map((d) => new BedesCompositeTermShort(d));
            }));
    }

    /**
     * Fetch a CompositeTerm from the API
     * @param id
     * @returns term
     */
    public getTerm(uuid: string): Observable<BedesCompositeTerm> {
        const url = this.urlUpdate.replace(/:id$/, uuid);
        console.log(`url = ${url}`);
        return this.http.get<IBedesCompositeTerm>(url, { withCredentials: true })
            .pipe(map((results: IBedesCompositeTerm) => {
                console.log(`${this.constructor.name}: received results`, results);
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
                console.log(`${this.constructor.name}: received results`, results);
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
        return this.http.post<IBedesCompositeTerm>(this.urlNew, compositeTerm)
        .pipe(map((results: IBedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received results`, results);
            // reload the bedes term list
            this.load();
            return new BedesCompositeTerm(results);
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
        return this.http.put<IBedesCompositeTerm>(url, compositeTerm)
        .pipe(map((results: IBedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received results`, results);
            // reload the bedes term list
            this.load();
            return new BedesCompositeTerm(results);
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
        return this.http.delete<number>(url)
        .pipe(map((results: number) => {
            console.log(`${this.constructor.name}: received results`, results);
            this.removeTermFromList(compositeTerm);
            return results;
        }));
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
        }
        else {
            throw new Error('Unable to find the CompositeTerm in the termList');
        }

    }


    // public search(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
    //     let httpParams = new HttpParams({
    //         fromObject: {
    //             search: searchStrings[0]
    //         }
    //     });
    //     searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
    //     return this.http.get<Array<IBedesCompositeTerm>>(this.url, { params: httpParams, withCredentials: true })
    //         .pipe(map((results) => {
    //             return results.map((item) =>
    //                 // if the object has an _options key it's a ContstrainedList
    //                 // everything else is a reguarl Term
    //                 item.hasOwnProperty('_options') ?
    //                 new BedesConstrainedList(<IBedesConstrainedList>item)
    //                 :
    //                 new BedesTerm(<IBedesTerm>item));
    //         }));
    // }

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

