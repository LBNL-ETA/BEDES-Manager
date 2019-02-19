import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option';

export interface IListOptionMapDialogData {
    constrainedList: BedesConstrainedList;
    excludeOptions: Array<BedesTermOption>
}
