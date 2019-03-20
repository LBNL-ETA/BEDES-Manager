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
import { SupportListType } from './support-list-type.enum';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';

@Injectable({
    providedIn: 'root'
})
export class SupportListService {
    private apiEndpoint = 'api/support-lists';
    private url: string = null;
    // unit list
    private unitList = new Array<BedesUnit>();
    private _unitListSubject: BehaviorSubject<Array<BedesUnit>>;
    get unitListSubject(): BehaviorSubject<Array<BedesUnit>> {
        return this._unitListSubject;
    }
    // data type list
    private dataTypeList = new Array<BedesDataType>();
    private _dataTypeSubject: BehaviorSubject<Array<BedesDataType>>;
    get dataTypeSubject(): BehaviorSubject<Array<BedesDataType>> {
        return this._dataTypeSubject;
    }
    // term category list
    private categoryList = new Array<BedesTermCategory>();
    private _termCategorySubject: BehaviorSubject<Array<BedesTermCategory>>;
    get termCategorySubject(): BehaviorSubject<Array<BedesTermCategory>> {
        return this._termCategorySubject;
    }
    // definition source
    private definitionSourceList = new Array<BedesDefinitionSource>();
    private _definitionSourceSubject: BehaviorSubject<Array<BedesDefinitionSource>>;
    get definitionSourceSubject(): BehaviorSubject<Array<BedesDefinitionSource>> {
        return this._definitionSourceSubject;
    }
    // application list
    private applicationList = new Array<MappingApplication>();
    private _applicationSubject: BehaviorSubject<Array<MappingApplication>>;
    get applicationSubject(): BehaviorSubject<Array<MappingApplication>> {
        return this._applicationSubject;
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
        this._applicationSubject = new BehaviorSubject<Array<MappingApplication>>([]);
    }

    /**
     * Loads the lookup tables for Bedes units, data types and term categories.
     * @returns load
     */
    public load(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.http.get<ISupportList>(this.url)
            .subscribe((results: ISupportList) => {
                // assign the unit list lookup table
                this.unitList = results._unitList.map((d) => new BedesUnit(d));
                this._unitListSubject.next(this.unitList);
                // assign the data type lookup table
                this.dataTypeList = results._dataTypeList.map((d) => new BedesDataType(d));
                this._dataTypeSubject.next(this.dataTypeList);
                // assign the term category lookup table
                this.categoryList = results._categoryList.map((d) => new BedesTermCategory(d));
                this._termCategorySubject.next(this.categoryList);
                // assing the definition source lookup table
                this.definitionSourceList = results._definitionSourceList.map((d) => new BedesDefinitionSource(d));
                this._definitionSourceSubject.next(this.definitionSourceList);
                // assign the application list lookup table
                this.applicationList = results._applicationList.map((d) => new MappingApplication(d));
                this._applicationSubject.next(this.applicationList);
                resolve(true);
            });
        });
    }

    /**
     * Transform an id for a given support list into a name.
     */
    public transformIdToName(listType: SupportListType, id: number): string {
        if (!id) {
            return '';
        }
        if (listType === SupportListType.BedesUnit) {
            return this.transformId(id, this.unitList);
        }
        else if (listType === SupportListType.BedesCategory) {
            return this.transformId(id, this.categoryList);
        }
        else if (listType === SupportListType.BedesDataType) {
            return this.transformId(id, this.dataTypeList);
        }
        else if (listType === SupportListType.BedesDefinitionSource) {
            return this.transformId(id, this.definitionSourceList);
        }
        else {
            throw new Error(`${this.constructor.name}: Invalid support list type`);
        }
    }

    public transformId(id: number, list: Array<any>): string {
        if (!id) {
            return '';
        }
        const item = list.find((d) => d.id === id);
        return item ? item.name : '';
    }

}
