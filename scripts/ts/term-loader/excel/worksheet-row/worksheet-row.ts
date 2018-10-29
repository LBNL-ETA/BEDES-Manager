import { IWorksheetRow } from "./worksheet-row.interface";
import { createLogger }  from '@script-common/logging';
const logger = createLogger(module);

/**
 * Represents a row of data from the BEDES V2.1_0.xlsx file.
 */
export class WorksheetRow implements IWorksheetRow {
    public term: string | null | undefined;
    public definition: string | null | undefined;
    public dataType: string | null | undefined;
    public unit: string | null | undefined;
    public definitionSource: string | null | undefined;

    /**
     * Creates an instance of worksheet row.
     * @param data 
     */
    constructor(
        data: IWorksheetRow 
    ) {
        this.term = data.term;
        this.definition = data.definition;
        this.dataType = data.dataType;
        this.unit = data.unit;
        this.definitionSource = data.definitionSource;

        this.cleanValues();
    }

    /**
     * Clean up the values for this object:
     */
    private cleanValues(): void {
        for (let key in this) {
            if (typeof this[key] === "string") {
                // @ts-ignore
                this[key] = <string>this[key].trim();
            }
            else if (typeof this[key] === "number") {
                // @ts-ignore
                this[key] = String(this[key]);
            }
            else {
                if (this[key] != null) {
                    logger.error(`Unexpected data type on key ${key}`);
                    throw new Error(`Expected ${key} to be an empty string.`);
                }
                // @ts-ignore
                this[key] = "";
            }
        }
    }

    /**
     * Determines whether the row is empty.
     * @returns true if row there is no data in the row.
     */
    public isEmpty(): boolean {
        if (this.term || this.definition || this.dataType || this.unit || this.definitionSource) {
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Determines if the row is the start of a new term definition,
     * which occurs when all columns are not blank.
     * @returns true if of definition 
     */
    public isStartOfDefinition(): boolean {
        if (this.term && this.dataType) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Determines whether the current row is a section title,
     * in which case the Term column is populated, and everything else blank
     * @returns true if section title 
     */
    public isSectionTitle(): boolean {
        if (this.term && !this.definition && !this.unit && !this.definitionSource) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Determines whether the row is part of a bedes constrained list definition.
     * ie is the current row a list option for a constrained list term
     * @returns true if the row has list option data 
     */
    public hasListOptionData(): boolean {
        if (!this.dataType) {
            return false;
        }
        else {
            return true;
        }
    }

}
