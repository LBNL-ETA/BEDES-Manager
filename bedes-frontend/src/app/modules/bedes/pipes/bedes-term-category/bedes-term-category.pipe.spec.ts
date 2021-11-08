import { BedesTermCategoryPipe } from './bedes-term-category.pipe';
import {TestBed} from '@angular/core/testing';
import {SupportListService} from '../../services/support-list/support-list.service';
import {HttpClient} from '@angular/common/http';

describe('BedesTermCategoryPipe', () => {
  it('create an instance', () => {
      TestBed.configureTestingModule({
          imports: [HttpClient],
          providers: [SupportListService],
      }).compileComponents();
    const pipe = new BedesTermCategoryPipe(TestBed.inject(SupportListService));
    expect(pipe).toBeTruthy();
  });
});
