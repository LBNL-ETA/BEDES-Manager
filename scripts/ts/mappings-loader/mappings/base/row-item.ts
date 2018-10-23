export class RowItem {
    public isEmpty(): boolean {
        for (let prop in this) {
            const value = this[prop];
            // consider empty string "" as empty
            if (typeof this[prop] === 'string' && String(this[prop]).trim()) {
                return false;
            }
        }
        return true;
    }
}