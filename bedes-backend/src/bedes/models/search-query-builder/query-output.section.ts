import { QuerySection } from './query-section.enum';
import { ISqlVariable } from './sql-variable.interface';

export class QueryOutputSection {
    private _querySection: QuerySection;
    public get querySection() : QuerySection {
        return this._querySection;
    }
    // Array of strings that make up the SQL Where clause
    private _sqlConditions: Array<string>;
    public get sqlConditions():Array<string> {
        return this._sqlConditions;
    }
    // sql variables to be used
    private _sqlVariables: Array<ISqlVariable>;
    public get sqlVariables() : Array<ISqlVariable> {
        return this._sqlVariables;
    }

    constructor(
        querySection: QuerySection
    ) {
        this._querySection = querySection;
        this._sqlConditions = new Array<string>();
        this._sqlVariables = new Array<ISqlVariable>();
    }

    /**
     * Returns the SQL query string to be used in the query.
     * 
     * Takes the array of strings in sqlConditions and joins them
     * together.
     */
    public getSqlConditions(): string {
        return this._sqlConditions.join(' ');
    }

    public buildSqlVariableObject(): any {
        const result: any = {};
        for (let item of this._sqlVariables) {
            // @ts-ignore
            result[item.sqlKey] = item.sqlValue
        }
        return result;
    }
    
}