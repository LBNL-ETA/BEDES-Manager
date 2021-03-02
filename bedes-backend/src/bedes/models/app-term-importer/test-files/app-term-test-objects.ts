import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { IAppTerm, IAppTermList, IAppTermListOption } from '@bedes-common/models/app-term';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';

/** Contains the AppTerm objects described in the app-term-import-test.csv file */
export const appTermTestObjects = new Array<AppTerm | AppTermList>();
const paramsA: IAppTerm = {
    _name: 'Term A',
    _description: 'This is a description of a value term with type degrees',
    _termTypeId: TermType.Atomic,
    // TODO: fix this
    // @ts-ignore
    _unitId: 10
}
appTermTestObjects.push(new AppTerm(paramsA));


const paramsB: IAppTermList = {
    _name: 'Term B',
    _description: 'This is a description of a constrained list, with units XXX, and trailing list options',
    _termTypeId: TermType.ConstrainedList,
    // TODO: fix this
    // @ts-ignore
    _unitId:25 ,
    _listOptions: [
        <IAppTermListOption>{
            _name: ''
        },
        {
            _name: 'List option B-1',
            _description: 'List Option B-1 description'
        },
        {
            _name: 'List option B-2',
            _description: 'List Option B-2 description'
        },
        {
            _name: 'List option B-3',
            _description: 'List Option B-3 description'
        },
        {
            _name: 'List option B-4',
            _description: 'List Option B-4 description'
        },
    ]
}
appTermTestObjects.push(new AppTerm(paramsB));
