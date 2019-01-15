import { ISearchOptionSection } from './search-option-section.interface';
/**
 * Interface for specifying BedesSearch options.
 */
export interface ISearchOptions {
    _bedesTerm?: ISearchOptionSection;
    _bedesConstrainedList?: ISearchOptionSection;
    _compositeTerm?: ISearchOptionSection;
}
