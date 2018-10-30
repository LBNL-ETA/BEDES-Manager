import { BedesRow } from './bedes-row';
import { getCellValue } from '@script-common/excel';
import { AppRow } from './app-row-hpxml';
import { ExcelRowExtractorBase } from '../base/excel-row-extractor-base';

/**
 * Extracts the AppRow and BedesRow objects from an HPXML spreadsheet.
 */
export class ExcelRowExtractor extends ExcelRowExtractorBase<AppRow, BedesRow> {
    constructor() {
        super();
    }

    /**
     * Returns a AppRow object, given the worksheet and row
     * @param sheet 
     * @param row Zero based row number.
     * @returns row item 
     */
    protected getAppRowItem(row: number): AppRow {
        if (!this.sheet) {
            throw new Error(`${this.constructor.name}: Excel Worksheet hasn't been set.`);
        }
        const item = new AppRow(
            getCellValue(this.sheet[`A${row}`]),
            getCellValue(this.sheet[`B${row}`]),
            getCellValue(this.sheet[`C${row}`]),
            getCellValue(this.sheet[`D${row}`]),
            getCellValue(this.sheet[`E${row}`]),
            getCellValue(this.sheet[`F${row}`]),
            getCellValue(this.sheet[`G${row}`]),
        );
        return item;
    }

    /**
     * Returns a BedesRow object given a Sheet row.
     * @param sheet 
     * @param row The row number from which to pull the Bedes data from.
     * @returns The Bedes term info from the row.
     */
    protected getBedesRowItem(row: number): BedesRow {
        if (!this.sheet) {
            throw new Error(`${this.constructor.name}: Excel Worksheet hasn't been set.`);
        }
        const item = new BedesRow(
            getCellValue(this.sheet[`H${row}`]),
            getCellValue(this.sheet[`I${row}`]),
            getCellValue(this.sheet[`J${row}`])
        );
        return item;
    }
}
