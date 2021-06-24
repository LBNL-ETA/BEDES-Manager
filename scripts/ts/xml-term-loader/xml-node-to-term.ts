import { createLogger }  from "@script-common/logging";
const logger = createLogger(module);
import { IXmlNodeTerm } from './xml-nodes/xml-node-term.interface';
import { IXmlTerm } from '@bedes-common/models/xml-term/xml-term.interface';
import { IXmlDefinition } from './xml-nodes/xml-definition.interface';
import { IBedesSector } from "@bedes-common/models/bedes-sector/bedes-sector.interface";
import * as util from 'util';

export function xmlNodeToTerm(node: IXmlNodeTerm): IXmlTerm {
    const termName = getValue(node, "Term", true);
    if (!termName) {
        throw new Error('termName is required');
    }
    const term: IXmlTerm = {
        uuid: getValue(node, "Content-UUID", true),
        url: getValue(node, "URL", true),
        name: fixTermName(termName),
        definition: getValue(node, "Definition"),
        dataTypeName: getValue(node, "Data-Type", true),
        unitName: getValue(node, "Unit-of-Measure", true),
        categoryName: getValue(node, "Category", true),
        sectorNames: splitString(getValue(node, 'Sector')),
        applicationNames: splitString(getValue(node, 'Application')),
    };
    return term;
}

function getValue(node: IXmlNodeTerm | IXmlDefinition, key: string, required?: boolean): string | undefined {
    // @ts-ignore
    const dataArray = node[key];
    let isArray = dataArray instanceof Array;
    if (!isArray && required) {
        logger.error(`Error retrieving value from XML file for key ${key}`);
        logger.error(util.inspect(node));
        throw new Error('Invalid node key, expected an array');
    }
    else if (!isArray) {
        return undefined;
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
        else if (dataArray.length === 1 && dataArray[0] === '') {
            return undefined;
        }
        else {
            // Strip any HTML formatting from Drupal.
            // @todo: Remove formatting in Drupal export instead, and then
            //  remove this hack.
            let stringValue = getValue(dataArray[0], 'p', true);
            // If it's still not a string, then it must have an extra <span>.
            // Work around this.
            if (typeof stringValue !== 'string' && stringValue) {
                logger.debug('stringValue with nested span');
                logger.debug(util.inspect(stringValue));
                // @ts-ignore
                if (stringValue.span && typeof stringValue.span[0] === 'string') {
                    // @ts-ignore
                   stringValue = stringValue.span[0];
                }
                // @ts-ignore
                else if (stringValue.span) {
                    // @ts-ignore
                    stringValue = stringValue.span[0]._;
                }
                // @ts-ignore
                else if (stringValue.a) {
                    // @ts-ignore
                    stringValue = stringValue._ + stringValue.a[0].$.href;
                }
            }
             if (!stringValue) {
                 return undefined;
             }
            return stringValue;
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
    return nameFromXml;
}

/**
 *
 */
function splitString(names: string | undefined): Array<string> | undefined {
    if (names) {
        return names.split(',').map((d) => d.trim())
    }
}
