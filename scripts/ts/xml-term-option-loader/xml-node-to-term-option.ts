import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { IBedesSector } from "@bedes-common/models/bedes-sector/bedes-sector.interface";
import { IXmlNodeTermOption } from './xml-nodes/xml-node-term-option.interface';
import { IXmlTermOption } from '../../../bedes-common/models/xml-term/xml-term-option.interface';

export function xmlNodeToTermOption(node: IXmlNodeTermOption): IXmlTermOption {
    const listOption = getValue(node, "List-Option", true);
    if (!listOption) {
        throw new Error('listOption is required');
    }
    const term: IXmlTermOption = {
        uuid: getValue(node, "Content-UUID", true),
        url: getValue(node, "URL", true),
        listOption: listOption,
        listOptionDefinition: getValue(node, "List-Option-Definition", true),
        unitName: getValue(node, "Unit-of-Measure", true),
        relatedTerm: getValue(node, "Related-Term", true),
        relatedTermUUID: getValue(node, "Related-Term-UUID", true),
        sectorNames: splitString(getValue(node, 'Sector', true)),
        applicationNames: splitString(getValue(node, 'Application')),
    };
    return term;
}

function getValue(node: IXmlNodeTermOption, key: string, required?: boolean): string | undefined {
    // @ts-ignore
    const dataArray = node[key];
    let validArray = dataArray instanceof Array;
    if (required && !validArray) {
        logger.error('Error retrieving value from XML file');
        throw new Error(`Invalid node key ${key}, expected an array`);
    }
    if (!required && !validArray) {
        return undefined;
    }
    if (dataArray.length) {
        return dataArray[0];
    }
    else if (required) {
        throw new Error('Required data not found');
    }

    return undefined;
}

/**
 *
 */
function splitString(names: string | undefined): Array<string> | undefined {
    if (names) {
        return names.split(',').map((d) => d.trim())
    }
}
