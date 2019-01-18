
/**
 * Object responsible for transforming the search string into
 * an array of SQL query conditions.
 */
export class SearchStringParser {
    /**
     * Build the object instance.
     */
    constructor() {
    }

    /**
     * Break up the search string into individual components.
     */
    public run(searchString: string): Array<string> {
        // build the set of tokens, assign it to _tokens.
        return this.tokenize(searchString);
    }

    /**
     * Break up the search strings into individual tokens.
     * These are used to build the various levels of SQL queries.
     */
    private tokenize(searchString: string): Array<string> {
        if (!searchString) {
            return [];
        }
        const results = new Array<string>();
        const items = searchString.trim().split(/\s+/);
        items.forEach((token: string) => {
            results.push(token);
        });
        return results;
    }

    /**
     * Count up the search values and operators.
     * TODO: is this neccesary?
     */
    // private buildTokenStats(): void {
    //     this._numSearchOperators = 0;
    //     this._numSearchValues = 0;
    //     this._tokens.forEach((token: string) => {
    //         if (this.isOperator(token)) {
    //             this._numSearchOperators++;
    //         }
    //         else {
    //             this._numSearchValues++;
    //         }
    //     });
    // }

    /**
     * Determines if the current token is an operator,
     * ie is it an AND, OR, or NOT
     */
    private isOperator(value: string): boolean {
        if (value === "AND" || value === "OR" || value === "NOT") {
            return true;
        }
        else {
            return false;
        }
    }

}