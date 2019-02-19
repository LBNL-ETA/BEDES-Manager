import "jasmine";
import { SearchQueryBuilder } from './search-query-builder';
import { ISearchOptions } from '@bedes-common/models/search-options/search-options.interface';
import { ISearchOptionSection } from '@bedes-common/models/search-options/search-option-section.interface';
import { SearchOptions } from '@bedes-common/models/search-options/search-options';

describe('SearchQueryBuilder', () => {
    it('Should be able to be instantiated', () => {
        const qbuilder = new SearchQueryBuilder();
        expect(qbuilder).toBeDefined();
    });

    it('Should accept ISearchOption parameters', () => {
        // create the constructor params
        const params: ISearchOptions = {
            _bedesTerm: <ISearchOptionSection>{
                _disabled: true
            },
            _compositeTerm: <ISearchOptionSection>{
                _nameDisabled: true
            }
        }
        // build the object
        const builder = new SearchQueryBuilder(new SearchOptions(params));
        expect(builder).toBeDefined();
        expect(builder.searchOptions.bedesTerm.disabled).toBe(true);
        expect(builder.searchOptions.bedesTerm.nameDisabled).toBe(false);
        expect(builder.searchOptions.bedesTerm.descriptionDisabled).toBe(false);
        expect(builder.searchOptions.bedesTerm.isEnabled()).toBe(false);

        expect(builder.searchOptions.bedesConstrainedList.disabled).toBe(false);
        expect(builder.searchOptions.bedesConstrainedList.nameDisabled).toBe(false);
        expect(builder.searchOptions.bedesConstrainedList.descriptionDisabled).toBe(false);
        expect(builder.searchOptions.bedesConstrainedList.isEnabled()).toBe(true);

        expect(builder.searchOptions.bedesTermListOption.disabled).toBe(false);
        expect(builder.searchOptions.bedesTermListOption.nameDisabled).toBe(false);
        expect(builder.searchOptions.bedesTermListOption.descriptionDisabled).toBe(false);
        expect(builder.searchOptions.bedesTermListOption.isEnabled()).toBe(true);

        expect(builder.searchOptions.compositeTerm.disabled).toBe(false);
        expect(builder.searchOptions.compositeTerm.nameDisabled).toBe(true);
        expect(builder.searchOptions.compositeTerm.descriptionDisabled).toBe(false);
        expect(builder.searchOptions.compositeTerm.isEnabled()).toBe(true);
        // run the builder
        const searchString = 'Annual Onsite -Renewable Electricity Resource Value';
        builder.run(searchString);
    });

    it('Should handle parenthesees in the search string', () => {
        // create the constructor params
        const params: ISearchOptions = {
            _bedesTerm: <ISearchOptionSection>{
                _descriptionDisabled: true
            },
            _compositeTerm: <ISearchOptionSection>{
                _disabled: true
            },
            _bedesConstrainedList: <ISearchOptionSection>{
                _disabled: true
            },
            _bedesTermListOption: <ISearchOptionSection>{
                _disabled: true
            }
        }
        // build the object
        const builder = new SearchQueryBuilder(new SearchOptions(params));
        expect(builder).toBeDefined();
        // set the search string
        const searchString = 'Renewable Electricity OR Resource OR Value';
        const results = builder.run(searchString);
        console.log(results);

    });
});
