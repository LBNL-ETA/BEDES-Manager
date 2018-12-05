import "jasmine";
import { IBedesCompositeTerm, BedesCompositeTerm } from '../models/bedes-composite-term';
import { TermCategory } from '../enums/term-type';
import { BedesDataType } from '../enums/bedes-data-type';
import { buildCompositeTermSignature } from './build-composite-term-signature';

describe("buildCompositeTermSignature", () => {
    it('Should correctly generate a signature string', () => {
        const params: IBedesCompositeTerm = {
            _signature: '1:300-2',
            _items: [{
                _term: {
                    _id: 2,
                    _termCategoryId: TermCategory.Contact,
                    _name: 'Bedes Term 1',
                    _description: 'A fake bedes term',
                    _dataTypeId: BedesDataType.Other
                },
                _orderNumber: 2
            }, {
                _term: {
                    _id: 1,
                    _termCategoryId: TermCategory.ControlsAndOperation,
                    _name: 'AnotherThingy',
                    _description: 'fakey fakey',
                    _dataTypeId: BedesDataType.ConstrainedList
                },
                _termOption: {
                    _id: 300,
                    _name: 'namey',
                    _description: 'namey description'
                },
                _orderNumber: 1
            }]
        };
        const term = new BedesCompositeTerm(params);
        expect(term.id).toBe(params._id);
        expect(term.signature).toBe(params._signature);
        const testSignature = buildCompositeTermSignature(term);
        expect(testSignature).toBe(term.signature, 'Composite term signature mismatch');
    })
});

