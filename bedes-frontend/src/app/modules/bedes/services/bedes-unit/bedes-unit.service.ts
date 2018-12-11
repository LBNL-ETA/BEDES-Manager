import { Injectable, Inject, OnInit } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BedesUnit, IBedesUnit } from '@bedes-common/models/bedes-unit';
import { ISupportList } from '@bedes-common/interfaces/support-list';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { IUsageCount } from '../../../../../../../bedes-common/interfaces/usage-count.interface';

@Injectable({
    providedIn: 'root'
})
export class BedesUnitService {
    private apiEndpoint = 'api/unit';
    private url: string = null;

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    /**
     * Generate a url for a specifc unitId and action name.
     */
    private buildUrl(unitId: number, actionName: string): string {
        return `${this.url}/${unitId}/${actionName}`;
    }

    /**
     * Get the usage count for a particular unit.
     */
    public getUsageCount(unitId: number): Observable<IUsageCount> {
        console.log(`${this.constructor.name}: get the usage count for unit ${unitId}`)
        if (!unitId) {
            throw new Error('Invalid parameter.');
        }
        const url = this.buildUrl(unitId, 'usage');
        return this.http.get<IUsageCount>(url);
    }

}


