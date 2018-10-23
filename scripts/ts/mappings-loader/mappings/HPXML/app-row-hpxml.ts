import { RowItem } from "../base/row-item";

export class AppRow extends RowItem {
    constructor(
        public appCode: string,
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