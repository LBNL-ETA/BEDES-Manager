import { Injectable, Inject, OnInit } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BedesUnit, IBedesUnit } from '@bedes-common/models/bedes-unit';
import { ISupportList } from '@bedes-common/interfaces/support-list';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { BedesDefinitionSource } from '@bedes-common/models/bedes-definition-source';
import { BedesSector } from '@bedes-common/models/bedes-sector/bedes-sector';

@Injectable({
    providedIn: 'root'
})
export class SupportListService {
    private apiEndpoint = 'api/support-lists';
    private url: string = null;
    // unit list
    private _unitListSubject: BehaviorSubject<Array<BedesUnit>>;
    get unitListSubject(): BehaviorSubject<Array<BedesUnit>> {
        return this._unitListSubject;
    }
    // data type list
    private _dataTypeSubject: BehaviorSubject<Array<BedesDataType>>;
    get dataTypeSubject(): BehaviorSubject<Array<BedesDataType>> {
        return this._dataTypeSubject;
    }
    // term category list
    private _termCategorySubject: BehaviorSubject<Array<BedesTermCategory>>;
    get termCategorySubject(): BehaviorSubject<Array<BedesTermCategory>> {
        return this._termCategorySubject;
    }
    // definition source
    private _definitionSourceSubject: BehaviorSubject<Array<BedesDefinitionSource>>;
    get definitionSourceSubject(): BehaviorSubject<Array<BedesDefinitionSource>> {
        return this._definitionSourceSubject;
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
        this._unitListSubject = new BehaviorSubject<Array<BedesUnit>>([]);
        this._dataTypeSubject = new BehaviorSubject<Array<BedesDataType>>([]);
        this._termCategorySubject = new BehaviorSubject<Array<BedesTermCategory>>([]);
        this._definitionSourceSubject = new BehaviorSubject<Array<BedesDefinitionSource>>([]);
    }

    /**
     * Loads the lookup tables for Bedes units, data types and term categories.
     * @returns load
     */
    public load(): Promise<boolean> {
        console.log(`${this.constructor.name}: retrieving support lists...`)
        return new Promise((resolve, reject) => {
            this.http.get<ISupportList>(this.url)
            .subscribe((results: ISupportList) => {
                console.log(`${this.constructor.name}: received results`, results);
                // assign the unit list lookup table
                this._unitListSubject.next(
                    results._unitList.map((d) => new BedesUnit(d))
                );
                // assign the data type lookup table
                this._dataTypeSubject.next(
                    results._dataTypeList.map((d) => new BedesDataType(d))
                );
                // assign the term category lookup table
                this._termCategorySubject.next(
                    results._categoryList.map((d) => new BedesTermCategory(d))
                );
                // assing the definition source lookup table
                this._definitionSourceSubject.next(
                    results._definitionSourceList.map((d) => new BedesDefinitionSource(d))
                )
                resolve(true);
            });
        });
    }

}
