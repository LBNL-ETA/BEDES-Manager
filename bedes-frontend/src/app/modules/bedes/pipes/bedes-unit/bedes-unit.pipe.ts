import { Pipe, PipeTransform } from '@angular/core';
import { BedesUnit } from '@bedes-common/models/bedes-unit';
import { SupportListService } from '../../services/support-list/support-list.service';

@Pipe({
  name: 'bedesUnit'
})
export class BedesUnitPipe implements PipeTransform {
    private unitList: Array<BedesUnit> = [];
    constructor(
        private supportListService: SupportListService
    ) {
        this.supportListService.unitListSubject
        .subscribe((unitList: Array<BedesUnit>) => {
            this.unitList = unitList;
        });
    }

    transform(value: number, args?: any): string {
        const id = Number(value);
        if (id) {
            const item = this.unitList.find((d) => d.id === id);
            if (item) {
                return item.name;
            }
        }
        return '**Unknown**'
    }
}
