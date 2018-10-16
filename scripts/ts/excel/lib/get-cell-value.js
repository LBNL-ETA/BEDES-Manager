"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCellValue(cell) {
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
exports.getCellValue = getCellValue;
function assignValue(cell, prop) {
    let value = getCellValue(cell);
    if (value !== null) {
        prop = value;
    }
}
