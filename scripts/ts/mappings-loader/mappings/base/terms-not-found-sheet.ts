import { TermNotFound } from './term-not-found';

export class TermsNotFoundSheet {
    constructor(
        public sheetName: string,
        public termsNotFound: Array<TermNotFound>
    ) {}
}
