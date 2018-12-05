import "jasmine";
import { BedesCompositeTerm } from './bedes-composite-term';
import { IBedesCompositeTerm } from './bedes-composite-term.interface';
import { TermCategory } from '../../enums/term-type';
import { BedesDataType } from "../../enums/bedes-data-type";
import { IBedesTerm } from '../bedes-term/bedes-term.interface';
import { BedesTerm } from '../bedes-term/bedes-term';
import { BedesTermOption } from '../bedes-term-option/bedes-term-option';
import { IBedesTermOption } from '../bedes-term-option/bedes-term-option.interface';

describe("BedesCompositeTerm", () => {
    it('Should create an empty object without data passed to constructor', () => {
        const term = new BedesCompositeTerm();
        expect(term.signature).toBe('');
    });

    it('Should populate from constructor parameters', () => {
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
        expect(term.items.length).toBe(params._items.length, 'Number of terms not equal');
        expect(term.items[0].orderNumber).toBe(params._items[1]._orderNumber, 'Terms not sorted by orderNumber');
    });

    it('Should be able to add BedesTerm objects', () => {
        const params: IBedesCompositeTerm = {
            _signature: '1-2:300',
            _items: []
        };
        const compTerm = new BedesCompositeTerm(params);
        const bedesTerm1 = new BedesTerm(<IBedesTerm>{
            _id: 1,
            _name: 'Builder Model',
            _description: 'A description',
            _termCategoryId: TermCategory.Premises,
            _dataTypeId: BedesDataType.Other,
        });
        const bedesTerm2 = new BedesTerm(<IBedesTerm>{
            _id: 2,
            _name: 'Climate Zone Type',
            _description: 'A description',
            _termCategoryId: TermCategory.Premises,
            _dataTypeId: BedesDataType.ConstrainedList,
        });
        const termOption2 = new BedesTermOption(<IBedesTermOption>{
            _id: 300,
            _name: 'DOE',
            _description: 'a description..'
        })
        // add a non-constrained-list atomic term
        compTerm.addBedesTerm(bedesTerm1);
        // order number of 1 should be set automatically
        expect(compTerm.items.length).toBe(1, `CompositeTermDetail not created from BedesTerm`);
        expect(compTerm.items[0].orderNumber).toBe(1, `CompositeTermDetail orderNumber not set correctly`);
        // create detail items from bedes terms
        compTerm.addBedesTerm(bedesTerm2, termOption2);
        expect(compTerm.items.length).toBe(2);
        expect(compTerm.items[1].term).toBe(bedesTerm2, 'BedesTerm not correctly assigned to BedesCompositeTerm');
        expect(compTerm.items[1].listOption).toBe(termOption2, 'BedesTermOption not correctly assigned');
        // try removing one of the terms
        // expect(compTerm.removeTerm(bedesTerm1.id));
        // expect(compTerm.items.length).toBe(1);
    });
});
