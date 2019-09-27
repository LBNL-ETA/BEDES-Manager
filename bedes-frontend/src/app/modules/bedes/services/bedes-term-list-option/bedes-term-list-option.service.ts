import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option.interface';
import { INewBedesTermOption } from '@bedes-common/models/new-list-option/new-list-option.interface';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option';
import { tap, map } from 'rxjs/operators';
import { BedesTermService } from 'src/app/modules/bedes/services/bedes-term/bedes-term.service';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term';

@Injectable({
    providedIn: 'root'
})
export class BedesTermListOptionService {
    private apiEndpoint = 'api/bedes-term-list-option';
    private url: string = null;
    private _activeListOptionSubject: BehaviorSubject<BedesTermOption | undefined>;
    get activeListOptionSubject(): BehaviorSubject<BedesTermOption | undefined> {
        return this._activeListOptionSubject;
    }

    constructor(
        private http: HttpClient,
        private termService: BedesTermService,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
        this._activeListOptionSubject= new BehaviorSubject<BedesTermOption | undefined>(undefined);
    }

    /**
     * Save a new list option to the database.
     */
    public newListOption(termId: number, newListOption: IBedesTermOption): Observable<IBedesTermOption> {
        const params: INewBedesTermOption = {
            termId: termId,
            termOption: newListOption
        };
        return this.http.post<IBedesTermOption>(this.url, params, { withCredentials: true })
        .pipe(
            tap((newOption: IBedesTermOption) => {
                const term = <BedesConstrainedList>this.termService.selectedTerm;
                if (term && term.options) {
                    // add the list option to the constrained list option list
                    (<BedesConstrainedList>this.termService.selectedTerm)
                        .addOption(new BedesTermOption(newOption));
                }
                else {
                }
            })
        );
    }

    /**
     * Build a url to a specific object, ie a specific object in the database.
     */
    private specificItemUrl(id: number): string {
        return `${this.url}/${id}`;
    }

    /**
     * Delete a specific list option
     */
    public deleteListOption(listOptionid: number): Observable<any> {
        return this.http.delete<any>(this.specificItemUrl(listOptionid), { withCredentials: true })
        .pipe(
            tap((results: any) => {
                this.termService.listOptionRemoved(listOptionid);
            })
        );
    }

    /**
     * Updates an existing BedesTermOption object.
     */
    public updateListOption(listOption: BedesTermOption): Observable<BedesTermOption> {
        if (!listOption.id) {
            throw new Error(`Can't save ListOption without an id`);
        }
        const url = this.specificItemUrl(listOption.id);
        return this.http.put<IBedesTermOption>(url, listOption.toInterface(), { withCredentials: true })
        .pipe(
            map((updatedOption: IBedesTermOption) => {
                return new BedesTermOption(updatedOption);
            })
        );
    }
}
