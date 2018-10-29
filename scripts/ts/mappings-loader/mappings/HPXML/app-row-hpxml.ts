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

    public isSectionHeader(): boolean {
        if (
            this.appCode && !this.dataElement && !this.definition && !this.units
            && !this.dataType && !this.enumeration && !this.notes
        ) {
            return true;
        }
        else {
            return false;
        }
    }
}