import "jasmine"
import path from 'path';
import { AppTermImporter } from './index';
import { AppTermList, AppTerm } from '@bedes-common/models/app-term';
import { appTermTestObjects } from './test-files/app-term-test-objects';

describe('AppTermImporter', () => {
    const filePath = path.join(__dirname, 'test-files');
    const fileName = 'app-term-import-test.csv';
    const termAExpected = <AppTerm>appTermTestObjects[0];
    const termBExpected = <AppTermList>appTermTestObjects[1];
    
    it('Should import terms', (done) => {
        const importer = new AppTermImporter(filePath, fileName);
        expect(importer).toBeDefined('AppTermImporter not instantiated.');
        importer.run().then(
            (appTerms: Array<AppTerm | AppTermList>) => {
                const termAActual = <AppTerm>appTerms[0];
                const termBActual = <AppTermList>appTerms[1];
                expect(Array.isArray(appTerms)).toBe(true);
                // test the termA object
                expect(termAExpected.name).toBe(termAActual.name);
                expect(termAExpected.description).toBe(termAActual.description);
                expect(termAExpected.termTypeId).toBe(termAActual.termTypeId);
                expect(termAExpected.unitId).toBe(termAActual.unitId);
                // test the termB object
                expect(termBExpected.name).toBe(termBActual.name);
                expect(termBExpected.description).toBe(termBActual.description);
                expect(termBExpected.termTypeId).toBe(termBActual.termTypeId);
                expect(termBExpected.unitId).toBe(termBActual.unitId);
                expect(termBExpected.listOptions.length).toBe(termBActual.listOptions.length);
                done();
            }, (error: any) => {
                console.log('An error occurred running the importer...');
                console.log(error);
                done();
            }
        );
    })
});