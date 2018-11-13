import { Pipe, PipeTransform } from '@angular/core';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { SupportListService } from '../../services/support-list/support-list.service';

@Pipe({
  name: 'bedesTermCategory'
})
export class BedesTermCategoryPipe implements PipeTransform {
    private categoryList: Array<BedesTermCategory> = [];
    constructor(
        private supportListService: SupportListService
    ) {
        this.supportListService.termCategorySubject
        .subscribe((categoryList: Array<BedesTermCategory>) => {
            this.categoryList = categoryList;
        });
    }

    transform(value: number, args?: any): string {
        const id = Number(value);
        if (id) {
            const item = this.categoryList.find((d) => d.id === id);
            if (item) {
                return item.name;
            }
        }
        return '**Unknown**'
    }

}
