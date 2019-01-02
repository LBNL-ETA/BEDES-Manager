import { BedesConstrainedList } from '../models/bedes-term/bedes-constrained-list';
import { BedesTerm, IBedesConstrainedList } from '../models/bedes-term';
import { BedesCompositeTerm } from '../models/bedes-composite-term/bedes-composite-term';
import { IBedesCompositeTerm } from '../models/bedes-composite-term/bedes-composite-term.interface';
import { ICompositeTermDetail } from '../models/bedes-composite-term/composite-term-item/composite-term-detail.interface';
import { IBedesTerm } from '../models/bedes-term/bedes-term.interface';
import { BedesMappingLabel } from '../../scripts/ts/mappings-loader/mappings/base/bedes-mapping-label';
import { IBedesTermOption } from '../models/bedes-term-option/bedes-term-option.interface';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option';
import { BedesTransformResultType } from '../../scripts/ts/mappings-loader/mappings/common/bedes-transform-result.type';
import { IBedesUnit } from '../models/bedes-unit/bedes-unit.template';

/**
 * Build a CompositeTerm object from a list of BedesTerm|BedesConstrainedList objects.
 *
 */
// export function buildCompositeTerm(bedesTerms: Array<BedesTerm | BedesConstrainedList>): BedesCompositeTerm {
//     const composite = new BedesCompositeTerm();
//     bedesTerms.map((d) => composite.addBedesTerm(d));
//     return composite;
// }

export function buildCompositeTermFromInterface(transformResults: Array<BedesTransformResultType>, bedesUnit?: IBedesUnit): BedesCompositeTerm {
    // build the params if there's a unit present
    const params = bedesUnit ? <IBedesCompositeTerm>{_unitId: bedesUnit._id} : undefined;
    const composite = new BedesCompositeTerm(params);
    // convert each bedesTerm Object to either BedesTerm or BedesConstrainedList
    transformResults.forEach(([term, iTermOption, mappingLabel ]: BedesTransformResultType) => {
        const termOption = iTermOption ? new BedesTermOption(iTermOption) : undefined;
        composite.addBedesTerm(
            new BedesTerm(term),
            mappingLabel.isValueField(),
            termOption
        );
    });
    return composite;
}

/**
 * Determines if an object complies with the IBedesConstrainedList interface.
 * Used to differentiate regular BedesTerm objects from constrained list objects.
 *
 * @param {(IBedesTerm | IBedesConstrainedList)} item
 * @returns {item is IBedesConstrainedList}
 */
function isConstrainedList(item: IBedesTerm | IBedesConstrainedList): item is IBedesConstrainedList {
    return (<IBedesConstrainedList>item)._options !== undefined;
}