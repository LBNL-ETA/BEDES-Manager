import { BedesCompositeTerm } from '../models/bedes-composite-term/bedes-composite-term';
import { CompositeTermDetail } from '../models/bedes-composite-term/composite-term-item/composite-term-detail';

/**
 * Generates the unique signature for a BedesCompositeTerm,
 * ie concatenation of BedesTerms separated by a '-',
 * and a BedesConstrainedListOption is separated from its parent term id with a ':'
 */
export function buildCompositeTermSignature(composite: BedesCompositeTerm): string {
    return buildSignatureFromCompositeTermDetail(composite.items);
}

export function buildSignatureFromCompositeTermDetail(
    items: Array<CompositeTermDetail>
): string {
    return items.map(getSignatureItem).join('-');
}

/**
 * Retrieve the signature for the given CompositeTermDetail object.
 * @param detailItem 
 * @returns signature item 
 */
export function getSignatureItem(detailItem: CompositeTermDetail): string {
    if (detailItem.listOption) {
        return `${detailItem.term.id}:${detailItem.listOption.id}`;
    }
    else {
        return `${detailItem.term.id}`;
    }
}