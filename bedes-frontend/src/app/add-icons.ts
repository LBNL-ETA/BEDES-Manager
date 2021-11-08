/**
 * FontAwasome Icons
 *
 * angular fontawasome: https://www.npmjs.com/package/@fortawesome/angular-fontawesome
 * icon list: https://fontawesome.com/icons?d=listing&s=solid
 * sizing: https://fontawesome.com/how-to-use/on-the-web/styling/sizing-icons
 */

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import {
    faHome,
    faTasks,
    faCaretDown,
    faBars,
    faAngleRight,
    faAngleDown,
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
    faUserPlus,
    faBan,
    faShieldAlt,
    faProjectDiagram,
    faList,
    faTimesCircle,
    faEdit,
    faTimes,
    faSave,
    faChevronCircleLeft,
    faChevronCircleRight,
    faChevronCircleUp,
    faChevronCircleDown,
    faCog,
    faSignInAlt,
    faSignOutAlt,
    faDownload,
    faCloudDownloadAlt,
    faMapMarkedAlt,
    faFileImport,
    faCheckCircle,
    faKey,
    faCopyright,
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

/**
 * Add the Fontawesome icons to the project.
 * This bypasses the need to load the icons in each component.
 */
export function addIcons(library: FaIconLibrary): void {
    library.addIcons(faHome);
    library.addIcons(faTasks);
    library.addIcons(faCaretDown);
    library.addIcons(faAngleDown);
    library.addIcons(faBars);
    library.addIcons(faAngleRight);
    library.addIcons(faPlusCircle);
    library.addIcons(faTrash);
    library.addIcons(faEllipsisV);
    library.addIcons(faFileCsv);
    library.addIcons(faFilePdf);
    library.addIcons(faFileExcel);
    library.addIcons(faCheck);
    library.addIcons(faExclamationTriangle);
    library.addIcons(faSearch);
    library.addIcons(faSpinner);
    library.addIcons(faPlayCircle);
    library.addIcons(faInfoCircle);
    library.addIcons(faSignInAlt);
    library.addIcons(faSignOutAlt);
    library.addIcons(faUserPlus);
    library.addIcons(faBan);
    library.addIcons(faShieldAlt);
    library.addIcons(faProjectDiagram);
    library.addIcons(faList);
    library.addIcons(faTimesCircle);
    library.addIcons(faEdit);
    library.addIcons(faTimes);
    library.addIcons(faSave);
    library.addIcons(faChevronCircleLeft);
    library.addIcons(faChevronCircleRight);
    library.addIcons(faChevronCircleUp);
    library.addIcons(faChevronCircleDown);
    library.addIcons(faCog);
    library.addIcons(faDownload);
    library.addIcons(faCloudDownloadAlt);
    library.addIcons(faMapMarkedAlt);
    library.addIcons(faFileImport);
    library.addIcons(faCheckCircle);
    library.addIcons(faKey);
    library.addIcons(faCopyright);
    library.addIcons(faPaperPlane);
}
