import { AppTerm, AppTermList } from '@bedes-common/models/app-term';
import { TermStatus } from './term-status.enum';

/**
 * Defines the row Object signature for the AppTerm ag-grid list.
 */
export interface IAppRow {
    termStatus: TermStatus;
    ref: AppTerm | AppTermList;
    mappedName: string;
}
