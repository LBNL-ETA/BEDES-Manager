
export abstract class QueryTokenBase {
    protected _tokenRawValue: string;
    get tokenRawValue() : string {
        return this._tokenRawValue;
    }
    set tokenRawValue(value: string) {
        this._tokenRawValue = value;
    }

    /**
     * Build the object instance.
     */
    constructor(tokenRawValue: string) {
        this._tokenRawValue = tokenRawValue;
    }

    /**
     * Determines if the token is a SQL operator,
     * ie AND or OR.
     */
    // public isOperator(): boolean {

    // }
}