/**
 * FontAwasome Icons
 *
 * angular fontawasome: https://www.npmjs.com/package/@fortawesome/angular-fontawesome
 * icon list: https://fontawesome.com/icons?d=listing&s=solid
 * sizing: https://fontawesome.com/how-to-use/on-the-web/styling/sizing-icons
 */


import { library } from '@fortawesome/fontawesome-svg-core';

import {
    faHome,
    faArrowToLeft,
    faArrowToRight,
    faTasks,
    faLightbulbDollar,
    faCalculatorAlt,
    faCaretDown,
    faBars,
    faAngleRight,
    faPlusCircle,
    faTrash,
    faEllipsisV,
    faFileCsv,
    faFilePdf,
    faFileExcel,
    faCheck,
    faExclamationTriangle,
    faSearch,
    faSpinner,
    faPlayCircle,
    faInfoCircle,
    faSignIn,
    faUserPlus,
    faBan,
    faShieldCheck,
    faShieldAlt,
    faProjectDiagram,
    faList,
    faTimesCircle,
    faEdit
} from '@fortawesome/pro-solid-svg-icons';

/**
 * Add the Fontawesome icons to the project.
 * This bypasses the need to load the icons in each component.
 */
export function addIcons (): void {
    library.add(faArrowToLeft);
    library.add(faArrowToRight);
    library.add(faHome);
    library.add(faTasks);
    library.add(faLightbulbDollar);
    library.add(faCalculatorAlt);
    library.add(faCaretDown);
    library.add(faBars);
    library.add(faAngleRight);
    library.add(faPlusCircle);
    library.add(faTrash);
    library.add(faEllipsisV);
    library.add(faFileCsv);
    library.add(faFilePdf);
    library.add(faFileExcel);
    library.add(faCheck);
    library.add(faExclamationTriangle);
    library.add(faSearch);
    library.add(faSpinner);
    library.add(faPlayCircle);
    library.add(faInfoCircle);
    library.add(faSignIn);
    library.add(faUserPlus);
    library.add(faBan);
    library.add(faShieldCheck);
    library.add(faShieldAlt);
    library.add(faProjectDiagram);
    library.add(faList);
    library.add(faTimesCircle);
    library.add(faEdit);
}
