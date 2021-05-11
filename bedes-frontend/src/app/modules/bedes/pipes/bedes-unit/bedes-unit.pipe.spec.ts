import {BedesUnitPipe} from './bedes-unit.pipe';
import {TestBed} from '@angular/core/testing';
import {SupportListService} from '../../services/support-list/support-list.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {API_URL, API_URL_TOKEN} from '../../services/url/url.service';

describe('BedesUnitPipe', () => {
    it('create an instance', () => {
        const API_URL_TOKEN_PROVIDER = [{
            provide: API_URL_TOKEN,
            useValue: API_URL
        }];
        TestBed.configureTestingModule({
                providers: [SupportListService, HttpClient, HttpHandler, API_URL_TOKEN_PROVIDER],
            }
        ).compileComponents();

        const pipe = new BedesUnitPipe(TestBed.get(SupportListService));
        expect(pipe).toBeTruthy();
    });
});
