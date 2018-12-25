import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { IXmlNodeTerm } from './xml-nodes/xml-node-term.interface';
import { IXmlTerm } from '@bedes-common/models/xml-term/xml-term.interface';
import { IXmlDefinition } from './xml-nodes/xml-definition.interface';
import { IBedesSector } from "@bedes-common/models/bedes-sector/bedes-sector.interface";

export function xmlNodeToTerm(node: IXmlNodeTerm): IXmlTerm {
    const termName = getValue(node, "Term", true);
    if (!termName) {
        throw new Error('termName is required');
    }
    const term: IXmlTerm = {
        uuid: getValue(node, "Content-UUID", true),
        url: getValue(node, "URL", true),
        name: fixTermName(termName),
        definition: getValue(node, "Definition", true),
        dataTypeName: getValue(node, "Data-Type", true),
        unitName: getValue(node, "Unit-of-Measure", true),
        categoryName: getValue(node, "Category", true),
        sectorNames: splitString(getValue(node, 'Sector', true)),
        applicationNames: splitString(getValue(node, 'Application', true)),
    };
    return term;
}

function getValue(node: IXmlNodeTerm | IXmlDefinition, key: string, required?: boolean): string | undefined {
    // @ts-ignore
    const dataArray = node[key];
    if (!(dataArray instanceof Array)) {
        logger.error('Error retrieving value from XML file');
        throw new Error('Invalid node key, expected an array');
    }
    if (key === "Definition") {
        // @ts-ignore
        if (!dataArray.length) {
            if (required) {
                throw new Error('No definition present');
            }
            else {
                return undefined; 
            }
        }
        else {
            // @ts-ignore
            return getValue(dataArray[0], 'p', true);
        }
    }
    else if (dataArray.length) {
        return dataArray[0];
    }
    else if (required) {
        throw new Error('Required data not found');
    }
    else {
        return undefined;
    }
}

/**
 * Either transforms an invalid term name to a valid one,
 * or passes the valid term name through.
 */
function fixTermName(nameFromXml: string): string {
    if (nameFromXml === 'Report Name') {
        return 'Project Name'; 
    }
    else {
        return nameFromXml;
    }
}

/**
 *
 */
function splitString(names: string | undefined): Array<string> | undefined {
    if (names) {
        return names.split(',').map((d) => d.trim())
    }
}
