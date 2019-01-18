import "jasmine";
import { SearchStringParser } from './search-string-parser';

describe('SearchQueryBuilder', () => {
    it('Should be able to be instantiated', () => {
        const parser = new SearchStringParser();
        expect(parser).toBeDefined();
    });

    it('Should accept constructor parameters', () => {
        const searchString = 'Annual Onsite Renewable Electricity Resource Value';
        // build and run the parser
        const parser = new SearchStringParser();
        const tokens = parser.run(searchString);
        expect(tokens.length).toBe(6);
    });

    it('Should transform a "-" to a "NOT"', () => {
        // the - infront of Renewable should be removed, and "NOT" inserted.
        const searchString = 'Annual Onsite -Renewable Electricity Resource Value';
        // build and run the parser
        const parser = new SearchStringParser();
        const tokens = parser.run(searchString);
        expect(tokens.length).toBe(6);
        // -Renewable should be "NOT Renewable"
        expect(tokens[2]).toBe("-Renewable");
    });

    it('Should handle AND, OR, and NOT search operators', () => {
        // the - infront of Renewable should be removed, and "NOT" inserted.
        const searchString = 'Annual AND energy';
        // build and run the parser
        const parser = new SearchStringParser();
        const tokens = parser.run(searchString);
        expect(tokens.length).toBe(3);
    });
});
