import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MappingApplication, IMappingApplication } from '@bedes-common/models/mapping-application';
import { SupportListService } from '../support-list/support-list.service';

@Injectable({
    providedIn: 'root'
})
export class ApplicationService {
    private apiEndpoint = 'api/mapping-application';
    private url: string = null;
    private applicationList = new Array<MappingApplication>();
    // Behavior subject that contains the list of applications.
    private _appListSubject = new BehaviorSubject<Array<MappingApplication>>([]);
    get appListSubject(): BehaviorSubject<Array<MappingApplication>> {
        return this._appListSubject;
    }
    // Subject that emits the currently selected Application
    private _selectedItemSubject = new BehaviorSubject<MappingApplication | undefined>(undefined);
    get selectedItemSubject(): BehaviorSubject<MappingApplication | undefined> {
        return this._selectedItemSubject;
    }
    // Contains a reference to the currently selected application
    private _selectedItem: MappingApplication | undefined;
    get selectedItem(): MappingApplication| undefined {
        return this._selectedItem;
    }

    constructor(
        private http: HttpClient,
        private supportListService: SupportListService,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    /**
     * Load's the initial list of all Applications, called
     * from the ApplicationListFactory during startup.
     */
    public load(): Promise<boolean> {
        try {
            console.log(`${this.constructor.name}: retrieving application list...`)
            return new Promise((resolve, reject) => {
                this.getApplications().subscribe(
                    (applications: Array<MappingApplication>) => {
                        this.applicationList = applications;
                        this.appListSubject.next(this.applicationList);
                        resolve(true);
                    },
                    (error: any) => {
                        console.log(`${this.constructor.name}: error retrieving application list`);
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
     * Get the list of all applications.
     */
    public getApplications(): Observable<Array<MappingApplication>> {
        return this.http.get<Array<IMappingApplication>>(this.url, { withCredentials: true })
            .pipe(map((results: Array<IMappingApplication>) => {
                console.log(`${this.constructor.name}: received results`, results);
                // convert IApp to App objects.
                return results.map((d) => new MappingApplication(d));
            }));
    }

    /**
     * Save's a new application to the database.
     */
    public newApplication(app: IMappingApplication): Observable<MappingApplication> {
        return this.http.post<IMappingApplication>(this.url, app, { withCredentials: true })
        .pipe(
            map((results: IMappingApplication) => {
                const newApp = new MappingApplication(results);
                this.addAppToList(newApp);
                return newApp;
            })
        );
    }

    /**
     * Update an existing MappingApplication object/record.
     */
    public updateApplication(app: IMappingApplication): Observable<MappingApplication> {
        return this.http.put<IMappingApplication>(this.url, app, { withCredentials: true })
        .pipe(
            map((results: IMappingApplication) => {
                const newApp = new MappingApplication(results);
                return newApp;
            })
        );
    }

    /**
     * Add a new MappingApplication object to the master list.
     * Will also update the associate BehaviorSubject.
     */
    private addAppToList(app: MappingApplication): void {
        if (this.applicationList.find((d) => d.id === app.id)) {
            throw new Error('Duplicate application id');
        }
        else {
            this.applicationList.push(app);
            this.appListSubject.next(this.applicationList);
        }
    }

    /**
     * Set's the active MappingApplication by ID.
     * Given an applicationId, find the matching
     * MappingApplication object by matching id,
     * then call the BehaviorSubect.next.
     */
    public setActiveApplicationById(id: number): void {
        if (this.selectedItem && id === this.selectedItem.id) {
            return;
        }
        const found = this.applicationList.find((d) => d.id === id)
        if (found) {
            this.setActiveApplication(found);
        }
        else {
            throw new Error(`Invalid applicationId ${id}`);
        }

    }

    /**
     * Set's the active MappingApplication, calls the
     * BehaviorSubject.next to notify subscribers.
     */
    public setActiveApplication(app: MappingApplication): void {
        this._selectedItem = app;
        this._selectedItemSubject.next(this._selectedItem);

    }
}
