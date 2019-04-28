import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MappingApplication, IMappingApplication } from '@bedes-common/models/mapping-application';
import { SupportListService } from '../support-list/support-list.service';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';

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
    /* The current user */
    public currentUser: CurrentUser;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
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

    public loadUserApplications(): Observable<Array<MappingApplication>> {
        return this.getApplications()
            .pipe((tap((apps: Array<MappingApplication>) => {
                this.applicationList = apps;
                this.appListSubject.next(this.applicationList);
            })));
    }

    /**
     * Get the list of all applications.
     */
    public getApplications(): Observable<Array<MappingApplication>> {
        return this.http.get<Array<IMappingApplication>>(this.url, { withCredentials: true })
            .pipe(map((results: Array<IMappingApplication>) => {
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
                this.authService.checkLoginStatus();
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
     * Delete a MappingApplication.
     *
     * @returns {boolean} True if the record was successfully deleted, false otherwise.
     */
    public deleteApplication(app: MappingApplication): Observable<boolean> {
        if (!app.id) {
            throw new Error('Invalid object deleted');
        }
        const url = `${this.url}/${app.id}`;
        return this.http.delete<number>(url, { withCredentials: true })
        .pipe(
            map((results: number) => {
                if (results) {
                    this.removeAppFromList(app);
                    this.setActiveApplication(undefined);
                    return true;
                }
                else {
                    return false;
                }
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
     * Remove a MappingApplication object from the applicationList array.
     */
    private removeAppFromList(app: MappingApplication): void {
        const index = this.applicationList.findIndex((item) => item.id === app.id);
        if (index >= 0) {
            this.applicationList.splice(index, 1);
            this.appListSubject.next(this.applicationList);
        }
        else {
            throw new Error('MappingApplicaton not found');
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
    public setActiveApplication(app: MappingApplication | undefined): void {
        this._selectedItem = app;
        this._selectedItemSubject.next(this._selectedItem);

    }
}
