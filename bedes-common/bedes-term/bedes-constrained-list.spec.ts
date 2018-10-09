import "jasmine";
import { TermType } from '../enums';
import { IBedesTermConstrainedList } from './bedes-constrained-list.interface';
import { BedesConstrainedList } from './bedes-constrained-list';
import { IBedesTermOption } from "../bedes-term-option/bedes-term-option.interface";
import { BedesTermOption } from "../bedes-term-option/bedes-term-option";

describe('BedesConstrainedList', () => {
    it('Should not require initial options', () => {
        const params = <IBedesTermConstrainedList>{
            _name: 'Test Term',
            _description: 'Term description goes here...',
            _termTypeId: TermType.Global
        };
        const item = new BedesConstrainedList(params);
        expect(item).toBeTruthy();
    });
    it('Should allow passing of Term Options via the constructor', () => {
        const params = <IBedesTermConstrainedList>{
            _name: 'Test Term',
            _description: 'Term description goes here...',
            _termTypeId: TermType.Global,
            _options: new Array<IBedesTermOption>()
        };
        // build a few List Options
        params._options.push(<IBedesTermOption>{
            _name: 'Option #1',
            _description: 'A more detailed description of Option #1'
        });
        params._options.push(<IBedesTermOption>{
            _name: 'Option #2',
            _description: 'A more detailed description of Option #2'
        })
        params._options.push(<IBedesTermOption>{
            _name: 'Option #3',
            _description: 'A more detailed description of Option #3'
        })
        const item = new BedesConstrainedList(params);
        expect(item).toBeTruthy();
        expect(item.options.length).toBe(params._options.length);
    });
    it('Should allow addition of Bedes Options through the addOption method', () => {
        const params = <IBedesTermConstrainedList>{
            _name: 'Test Term',
            _description: 'Term description goes here...',
            _termTypeId: TermType.Global
        };
        const item = new BedesConstrainedList(params);
        expect(item).toBeTruthy();
        expect(item.options.length).toBe(0);
        // add a list option
        item.addOption(
            new BedesTermOption(<IBedesTermOption>{
                _name: 'Option #1',
                _description: 'Description for Option #1'
            })
        );
        expect(item.options.length).toBe(1);
        // add another option
        item.addOption(
            new BedesTermOption(<IBedesTermOption>{
                _name: 'Option #2',
                _description: 'Description for Option #2'
            })
        );
        expect(item.options.length).toBe(2);
        
    });
});
