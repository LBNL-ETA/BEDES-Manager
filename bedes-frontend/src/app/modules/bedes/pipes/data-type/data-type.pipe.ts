import { Pipe, PipeTransform } from '@angular/core';
import { SupportListService } from '../../services/support-list/support-list.service';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';

@Pipe({
    name: 'bedesDataType'
})
export class DataTypePipe implements PipeTransform {
    private dataTypeList: Array<BedesDataType> = [];
    constructor(
        private supportListService: SupportListService
    ) {
        this.supportListService.dataTypeSubject
        .subscribe((dataTypeList: Array<BedesDataType>) => {
            this.dataTypeList = dataTypeList;
        });
    }

    transform(value: number, args?: any): string {
        const id = Number(value);
        if (id) {
            const item = this.dataTypeList.find((d) => d.id === id);
            if (item) {
                return item.name;
            }
        }
        return '**Unknown**'
    }

}
