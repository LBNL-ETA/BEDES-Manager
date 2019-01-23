import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BedesCompositeTerm, IBedesCompositeTerm } from '@bedes-common/models/bedes-composite-term';

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
    private termList: Array<BedesCompositeTerm>;
    /* BehaviorSubject that emits the current list of composite terms */
    private _termListSubject = new BehaviorSubject<Array<BedesCompositeTerm>>([]);
    public get termListSubject(): BehaviorSubject<Array<BedesCompositeTerm>> {
        return this._termListSubject;
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.urlNew = `${this.apiUrl}${this.apiEndpointNew}`;
        this.urlUpdate = `${this.apiUrl}${this.apiEndpointUpdate}`;
    }

    /**
     * Load the list of composite terms during initialization.
     */
    public load(): Promise<boolean> {
        try {
            console.log(`${this.constructor.name}: retrieving composite term list...`)
            return new Promise((resolve, reject) => {
                this.getAll().subscribe(
                    (terms: Array<BedesCompositeTerm>) => {
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
    public getAll(): Observable<Array<BedesCompositeTerm>> {
        return this.http.get<Array<IBedesCompositeTerm>>(this.urlNew, { withCredentials: true })
            .pipe(map((results: Array<IBedesCompositeTerm>) => {
                console.log(`${this.constructor.name}: received results`, results);
                if (!Array.isArray(results)) {
                    throw new Error(`${this.constructor.name}: getAll expected to receive an array of composite terms`);
                }
                return results.map((d) => new BedesCompositeTerm(d));
            }));
    }

    /**
     * Fetch a CompositeTerm from the API
     * @param id
     * @returns term
     */
    public getTerm(id: number): Observable<BedesCompositeTerm> {
        const url = this.urlUpdate.replace(/:id$/, String(id));
        console.log(`url = ${url}`);
        return this.http.get<IBedesCompositeTerm>(url, { withCredentials: true })
            .pipe(map((results: IBedesCompositeTerm) => {
                console.log(`${this.constructor.name}: received results`, results);
                return new BedesCompositeTerm(results);
            }));
    }

    /**
     * Saves a new CompositeTerm to the database.
     */
    public saveNewTerm(compositeTerm: BedesCompositeTerm): Observable<BedesCompositeTerm> {
        return this.http.post<IBedesCompositeTerm>(this.urlNew, compositeTerm)
        .pipe(map((results: IBedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received results`, results);
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
            return new BedesCompositeTerm(results);
        }));
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
     * Set's the active composite term to the term with a matching id.
     */
    public setActiveCompositeTermById(id: number): void {
        if (this._selectedTerm && id === this._selectedTerm.id) {
            return;
        }
        const found = this.termList.find((d) => d.id === id)
        if (found) {
            this.setActiveCompositeTerm(found);
        }
        else {
            throw new Error(`Invalid BedesCompositeTerm.id ${id}`);
        }
    }
}

