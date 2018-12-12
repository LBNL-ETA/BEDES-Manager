import { AppRow } from '../HPXML/app-row-hpxml';

export class TermNotFound {
    constructor(
        public termName: string,
        public appRows: Array<AppRow>
    ) {}
}
