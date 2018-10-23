import { RowItem } from "../base/row-item";

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
} 
