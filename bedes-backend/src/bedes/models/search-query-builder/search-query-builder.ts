import { SearchOptionSection } from '@bedes-common/models/search-options/search-option-section';
import { SearchOptions } from '../../../../../bedes-common/models/search-options/search-options';
import { ISearchOptions } from '@bedes-common/models/search-options/search-options.interface';
import { SearchStringParser } from './search-string-parser/search-string-parser';
import { ISqlVariable } from './sql-variable.interface';
import { QueryBuilderOutput } from './query-builder-output/query-builder.output';
import { QueryOutputSection } from './query-output.section';

/**
 * Build's the dynamic queries for searching for BEDES terms.
 */
export class SearchQueryBuilder {
    // Contains the search string to transform to SQL conditinos.
    private _searchOptions: SearchOptions;
    get searchOptions(): SearchOptions {
        return this._searchOptions;
    }
    // the query string parser
    private _parser: SearchStringParser;
    // the query token strings
    private _tokens: Array<string> | undefined;
    get tokens(): Array<string> | undefined {
        return this._tokens;
    }

    /**
     * Build the object instance.
     * If no parameters are passed, default search option
     * is to to enable all search fields.
     */
    constructor(data?: ISearchOptions) {
        // create the SearchOptions object
        this._searchOptions = new SearchOptions(data);
        this._parser = new SearchStringParser();
    }

    /**
     * Generate the SQL based on the object's SearchOptions,
     * and the searchString passed in.
     */
    public run(searchString: string): QueryBuilderOutput {
        const results = '';
        // break up the string into inidividual words
        this._tokens = this._parser.run(searchString);
        // builds the search conditions
        const builderOutput: QueryBuilderOutput = this.parseTokens();
        return builderOutput;
    }

    /**
     * Build the SQL conditions from the string tokens.
     */
    private parseTokens():  QueryBuilderOutput {
        console.log('\nparse tokens');
        if (!Array.isArray(this.tokens)) {
            throw new Error(`${this.constructor.name}: parseTokens expects tokens to parse.`)
        }
        // sets the default operation, for when operators are not present
        const defaultOp = 'OR';
        // boolean indicating if the previous token was an operator or a value
        let wasLastTokenOperator = false;
        // const operator = '~*';
        const operator = 'ILIKE';
        const negatedOperator = 'NOT ILIKE';
        let sqlIndex = 1;
        // function for generating new sql keys
        // SQL expects variables to look like ${variableName}
        const newSqlKey = () => {
            return `_searchNum${sqlIndex++}`;
        }
        // create a new output object to hold all the results
        const output = new QueryBuilderOutput();
        // loop through each section
        for (const key in this.searchOptions) {
            console.log(`key = ${key}`)
            console.log(output);
            // reset the sqlIndex so the sqlKey variable start at #1
            sqlIndex = 1;
            // @ts-ignore - linter doesn't like searchOptions[key] (it works)
            const section: SearchOptionSection = this.searchOptions[key];
            // @ts-ignore
            const outputSection: QueryOutputSection = output[key];
            console.log(`output section for key ${key} = `)
            console.log(outputSection);
            // skip this section if the section is disabled
            if (!section.isEnabled()) {
                continue
            }
            // loop through all the search tokens
            for (let token of this.tokens) {
                console.log(`\ntoken = ${token}`);
                if (this.isTokenOperator(token)) {
                    // push the operators as is
                    console.log(`Found an operator ${token}`);
                    // let the next token know that an operator was found in the previous token
                    // so no need to insert a default operator (defaultOp)
                    wasLastTokenOperator = true;
                    outputSection.sqlConditions.push(token);
                } 
                else {
                    // get a new key for the search string
                    const sqlKey = newSqlKey();
                    console.log(`${this.constructor.name}: object key = ${key}`)
                    // check if need to negate the sql condition
                    // ie the token starts with a dash
                    const isConditionNegated = token.startsWith('-') ? true : false;
                    if (isConditionNegated) {
                        // remove the preceding dash
                        token = token.substring(1);
                    }
                    // check for leading/trailing parenthesees
                    const hasLeadingParen = token.startsWith("(");
                    let leadingParen = hasLeadingParen ? '(' : '';
                    if (hasLeadingParen) {
                        token = token.substring(1);
                    }
                    const hasTrailingParen = token.endsWith(")");
                    if (hasTrailingParen) {
                        token = token.substring(0, token.length -1)
                    }
                    let trailingParen = hasTrailingParen ? ')' : '';
                    // indicates if there's multiple conditions for this token,
                    // ie is the token tested against more than one column
                    // if so need to wrap the conditions in parenthesees
                    const hasMultpleConditions = !section.nameDisabled && !section.descriptionDisabled
                        ? true 
                        : false;
                    let multipleCondLeadingParen = '';
                    let multipleCondTrailingParen = '';
                    if (hasMultpleConditions) {
                        multipleCondLeadingParen = '(';
                        multipleCondTrailingParen = ')';
                    }

                    // add the sql key/search value to the array
                    outputSection.sqlVariables.push(<ISqlVariable>{
                        sqlKey: sqlKey,
                        sqlValue: `%${token}%`
                    });
                    // Add in an operator if necessary
                    // ie if the last token was not an operator and there are preceding conditions
                    if (!wasLastTokenOperator && outputSection.sqlConditions.length) {
                        outputSection.sqlConditions.push(defaultOp);
                    }
                    // add the search strings for name/description, if enabled
                    // at least one of them should be enabled
                    if (!section.nameDisabled) {
                        // if there's a traling parenthasees, remove it
                        // will be added back in below in the description section
                        if (hasTrailingParen && !section.descriptionDisabled) {
                            trailingParen = '';
                        }
                        outputSection.sqlConditions.push(`${leadingParen}${multipleCondLeadingParen}t.name ${ isConditionNegated ? negatedOperator : operator} \${${sqlKey}}${trailingParen}`);
                        // remove the parenthasees
                        if (hasLeadingParen) {
                            leadingParen = '';
                        }
                    }
                    if (!section.descriptionDisabled) {
                        // add the trailing parenthasees back in
                        if (hasTrailingParen && !section.nameDisabled) {
                            trailingParen = ')';
                        }
                        // need to add in an operator if a name search condition was added
                        if (!section.nameDisabled) {
                            outputSection.sqlConditions.push(defaultOp);
                        }
                        outputSection.sqlConditions.push(`${leadingParen}t.description ${ isConditionNegated ? negatedOperator : operator} \${${sqlKey}}${multipleCondTrailingParen}${trailingParen}`);
                    }
                    wasLastTokenOperator = false;
                }
            }
            console.log('output for section')
            console.log(outputSection.sqlConditions);
            console.log(outputSection.sqlVariables);
            outputSection.sqlVariables.forEach((d) => console.log(d));
        }
        return output;
    }

    /**
     * Determines if the value passed in is a SQL operator,
     * ie is it an AND|OR|NOT.
     */
    private isTokenOperator(value: string): boolean {
        const results = value.match(/^\(?(AND|OR|NOT)$/i);
        if (results) {
            return true;
        }
        else {
            return false;
        }
    }
}