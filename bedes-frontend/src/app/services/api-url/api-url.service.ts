import { Injectable, InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export const API_URL_TOKEN = new InjectionToken<string>('apiUrl');

let url = '';
if (environment.production) {
    url = '';
}
else {
    url = 'http://localhost:3000/';
}
export const API_URL = url;
