import { IBedesTerm } from '@bedes-common/models/bedes-term/bedes-term.interface';
import { IBedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list.interface';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option.interface';
import { BedesMappingLabel } from '../base/bedes-mapping-label';

export type BedesTransformResultType = [
    IBedesTerm | IBedesConstrainedList,
    IBedesTermOption | undefined,
    BedesMappingLabel
];
