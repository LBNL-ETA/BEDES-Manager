/**
 * The base interface for a Bedes Mapped Term.
 * Do not use this interface directly, should use the
 * derived interfaces: IBedesAtomicTermMap and IBedesCompositeTermMap.
 */
export interface IBedesTermMapBase {
    _id?: number | null | undefined;
    _mappedTermId?: number | null | undefined;
}
