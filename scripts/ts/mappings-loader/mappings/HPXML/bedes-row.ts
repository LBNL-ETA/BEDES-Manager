import { RowItem } from "../base/row-item";

/**
 * Represents a row of data from the Bedes Term columns
 */
export class BedesRow extends RowItem {
    constructor(
        public bedesTerm: string,
        public bedesMapping: string,
        public bedesUnit: string
    ) {
        super();
    }

    /**
     * Determines whether the row is the beginning
     * of a new BedesTerm
     * @returns true if the row is a new BedesTerm
     */
    public isStartOfNewTerm(): boolean {
        return this.bedesTerm ? true : false;
    }

    /**
     * Determines if the current row in the spreadsheet contains
     * more than 1 term
     * (mapping text can have linefeeds that separte terms)
     * @returns true if multiple terms 
     */
    public containsMultipleTerms(): boolean {
        return this.bedesMapping && this.bedesMapping.match(/\n/) ? true : false
    }

    /**
     * Determines if the BedesRow is a valid mapping.
     * The BedesRow could be a BedesTerm, BedesTermConstrainedList,
     * or a Constrained List Option.
     * @returns true if valid bedes term 
     */
    public isValidBedesObject(): boolean {
        if (
            !this.isEmpty()
            && (
                !this.bedesTerm
                || (
                    this.bedesTerm
                    && 
                    !this.bedesTerm.match(/no mapping/i)
                )
            )
        ) {
            return true;
        }
        else {
            return false;
        }
    }
} 
