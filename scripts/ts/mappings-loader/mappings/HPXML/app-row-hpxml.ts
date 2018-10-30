import { RowItem } from "../base/row-item";

/**
 * Represents an object from the Application columns from a Sheet row.
 */
export class AppRow extends RowItem {
    constructor(
        public appTermCode: string,
        public dataElement: string,
        public definition: string,
        public units: string,
        public dataType: string,
        public enumeration: string,
        public notes: string,
    ) {
        super();
    }
}