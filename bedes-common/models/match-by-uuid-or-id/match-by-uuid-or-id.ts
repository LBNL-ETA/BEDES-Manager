export abstract class MatchByUUIDOrId {
    protected _uuid: string | null | undefined;
    protected _id: number | null | undefined;

    /**
     * Determines if a given id, name or uuid is a match for this term instance.
     */
    public isMatch(value: number | string): boolean {
        if (typeof value === 'number') {
            return this.isMatchById(value);
        }
        else if (typeof value === 'string' && value.match(/^\d+$/)) {
            // id, which is an integer, coming in as a string, cast to number
            return this.isMatchById(+value);
        }
        else if (typeof value === 'string') {
            return this.isMatchByUUID(value);
        }
        else {
            throw new Error(`${this.constructor.name}: isMatch expects a number or string.`)
        }
    }

    /**
     * Determines if a given term id matches this term instance.
     */
    private isMatchById(value: number): boolean {
        return value === this._id ? true : false;
    }

    /**
     * Determines if the given name or uuid is a match to the term instance.
     */
    private isMatchByUUID(value: string): boolean {
        return value === this._uuid ? true : false;
    }

}
