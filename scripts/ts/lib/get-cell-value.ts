import * as XLSX from 'xlsx';

function getCellValue(cell: XLSX.CellObject): any {
    if (cell) {
        const value = cell.v;
        const formattedValue = cell.w;
        if (typeof value === 'string' && value.trim() === '') {
            // don't send back empty strings
            return null;
        }
        else if (cell.t === "n" && typeof formattedValue === 'string' && formattedValue.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
            // this should be a date object.
            return new Date(formattedValue);
        }
        else {
            return cell.v;
        }
    }
    else {
        return null;
    }
}

function assignValue(cell: XLSX.CellObject, prop: any): void {
    let value = getCellValue(cell);
    if (value !== null) {
        prop = value;
    }
}

export { getCellValue }
