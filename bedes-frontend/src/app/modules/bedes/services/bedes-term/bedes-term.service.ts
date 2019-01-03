import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option';
import {
    IBedesTerm,
    IBedesConstrainedList,
    BedesTerm,
    BedesConstrainedList
} from '@bedes-common/models/bedes-term';
import { BedesDataType } from '@bedes-common/enums/bedes-data-type';

@Injectable({
    providedIn: 'root'
})
export class BedesTermService {
    private apiEndpoint = 'api/bedes-term/:id';
    private url: string = null;
    // Subject that emits the currently selected BedesTerm.
    private _selectedTermSubject = new BehaviorSubject<BedesTerm | BedesConstrainedList>(undefined);
    get selectedTermSubject(): BehaviorSubject<BedesTerm | BedesConstrainedList | undefined> {
        return this._selectedTermSubject;
    }
    // Contains a reference to the currently selected term
    private _selectedTerm: BedesTerm | BedesConstrainedList | undefined;
    get selectedTerm(): BedesTerm | BedesConstrainedList | undefined {
        return this._selectedTerm;
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    /**
     * Fetch a BedesTerm or BedesConstrainedList  from the server.
     * @param id
     * @returns term
     */
    public getTerm(id: number | string): Observable<BedesTerm | BedesConstrainedList> {
        const url = this.url.replace(/:id$/, String(id));
        return this.http.get<IBedesTerm | IBedesConstrainedList>(url, { withCredentials: true })
            .pipe(map((results: IBedesTerm | IBedesConstrainedList) => {
                console.log(`${this.constructor.name}: received results`, results);
                if (results._dataTypeId === BedesDataType.ConstrainedList) {
                    return new BedesConstrainedList(<IBedesConstrainedList>results);
                }
                else {
                    return new BedesTerm(results);
                }
            }));
    }

    public listOptionRemoved(listOptionId: number): void {
        const currentTerm = this._selectedTermSubject.value;
        if (currentTerm instanceof BedesConstrainedList) {
            const index = currentTerm.options.findIndex((d) => d.id === listOptionId);
            if (index >= 0) {
                // remove the option from the list
                currentTerm.options.splice(index, 1);
                // notify subscribers of the change
                this.selectedTermSubject.next(currentTerm);
            }
            else {
                throw new Error(`listOptionRemoved couldn't find an item with id ${listOptionId}`);
            }
        }
        else {
            throw new Error(`listOptionRemoved error: selected term is not a constrained list`);
        }
    }

    /**
     * Add a new listOption to the current selected term.
     *
     * @param {BedesTermOption} listOption
     * @memberof BedesTermService
     */
    public listOptionAdded(listOption: BedesTermOption): void {

    }

    // public search(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
    //     let httpParams = new HttpParams({
    //         fromObject: {
    //             search: searchStrings[0]
    //         }
    //     });
    //     searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
    //     return this.http.get<Array<IBedesTerm | IBedesConstrainedList>>(this.url, { params: httpParams, withCredentials: true })
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
}
