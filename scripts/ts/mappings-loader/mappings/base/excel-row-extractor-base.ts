import * as XLSX from 'xlsx';
import { RowItem } from './row-item';

/**
 * Extracts the AppRow and BedesRow objects from a spreadsheet.
 */
export abstract class ExcelRowExtractorBase<A extends RowItem, B extends RowItem> implements Iterable<[A, B] | [undefined, undefined]> {
    protected sheet: XLSX.Sheet | undefined;
    protected abstract getAppRowItem(row: number): A;
    protected abstract getBedesRowItem(row: number): B;

    constructor() {
    }

    public setSheet(sheet: XLSX.Sheet): void {
        this.sheet = sheet;
    }

    /**
     * Iterator definition for looping through the valid rows in the spreadsheet.
     * @returns [symbol.iterator] 
     */
    public [Symbol.iterator](): Iterator<[A, B] | [undefined, undefined]> {
        try {
            let row = 3;
            let appRow: A;
            let bedesRow: B;

            if (!this.sheet) {
                throw new Error(`${this.constructor.name}: Excel Worksheet hasn't been set.`);
            }

            // build the function to get the next set of Row objects.
            const nextRowItems = (row: number): [A, B] => {
                let appRow = this.getAppRowItem(row);
                let bedesRow = this.getBedesRowItem(row);
                // if (bedesRow.bedesTerm && bedesRow.bedesTerm.match(/no mapping/i)) {
                //     bedesRow.bedesTerm = ""; 
                // }
                return [appRow, bedesRow];
            };

            return {
                next(): IteratorResult<[A, B] | [undefined, undefined]> {
                    // get the next set of row objects
                    // if they're both empty then finished
                    [appRow, bedesRow] = nextRowItems(row++);
                    if (!appRow.isEmpty() || !bedesRow.isEmpty()) {
                        return {
                            done: false,
                            value: [appRow, bedesRow]
                        };
                    }
                    else {
                        return {
                            done: true,
                            value: [undefined, undefined] 
                        };
                    }
                }
            }
        }
        catch (error) {
            throw error;
        }
    }

}
