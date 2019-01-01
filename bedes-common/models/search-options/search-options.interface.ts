/**
 * Interface for specifying BedesSearch options.
 */
export interface ISearchOptions {
    bedesTerm?: {
        disabled?: boolean;
        name?: boolean;
        description?: boolean;
    },
    bedesConstrainedList?: {
        disabled?: boolean;
        name?: boolean;
        description?: boolean;
    },
    termListOption?: {
        disabled?: boolean;
        name?: boolean;
        description?: boolean;
    },
    compositeTerm?: {
        disabled?: boolean;
        name?: boolean;
        description?: boolean;
    }
}
