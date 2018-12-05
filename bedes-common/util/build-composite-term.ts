import { BedesConstrainedList } from '../models/bedes-term/bedes-constrained-list';
import { BedesTerm, IBedesConstrainedList } from '../models/bedes-term';
import { BedesCompositeTerm } from '../models/bedes-composite-term/bedes-composite-term';
import { IBedesCompositeTerm } from '../models/bedes-composite-term/bedes-composite-term.interface';
import { ICompositeTermDetail } from '../models/bedes-composite-term/composite-term-item/composite-term-detail.interface';
import { IBedesTerm } from '../models/bedes-term/bedes-term.interface';

/**
 * Build a CompositeTerm object from a list of BedesTerm|BedesConstrainedList objects.
 *
 */
export function buildCompositeTerm(bedesTerms: Array<BedesTerm | BedesConstrainedList>): BedesCompositeTerm {
    const composite = new BedesCompositeTerm();
    bedesTerms.map((d) => composite.addBedesTerm(d));
    return composite;
}

export function buildCompositeTermFromInterface(bedesTerms: Array<IBedesTerm | IBedesConstrainedList>): BedesCompositeTerm {
    const composite = new BedesCompositeTerm();
    // convert each bedesTerm Object to either BedesTerm or BedesConstrainedList
    bedesTerms.forEach((item: IBedesTerm | IBedesConstrainedList) => {
        if (isConstrainedList(item)) {
            composite.addBedesTerm(new BedesConstrainedList(item));
        }
        else {
            composite.addBedesTerm(new BedesTerm(item));
        }
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