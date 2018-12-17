/**
 * Defines the interface for Bedes Atomic term mapping to applications
 */
export interface IBedesAtomicTermMap {
    _id?: number | null | undefined;
    _mappedTermId?: number | null | undefined;
    _bedesTermId: number;
}
