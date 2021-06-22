import { IXmlNodeTerm } from './xml-node-term.interface';
import { validXmlNodeDefinition } from './valid-xml-node-definition';
import {createLogger} from "@script-common/logging";
import * as util from 'util';

const logger = createLogger(module);

/**
 * Examines an object and determines if it implements the IXmlNode interface correctly.
 */
export function validXmlNode(data: IXmlNodeTerm): boolean {
    if (data instanceof Object) {
        for (let key of Object.keys(dummyNode)) {
            // @ts-ignore
            const dataList = data[key];
            if (dataList) {
                // If the dataList contains a single empty string, treat it as
                // if it's empty and let it pass validation.
                if (dataList instanceof Array && dataList.length === 1 && dataList[0] === '') {
                    continue;
                }
                if (key === 'Definition' && !validXmlNodeDefinition(dataList)) {
                    logger.debug('Invalid because of XML definition:');
                    logger.debug(util.inspect(dataList));
                    logger.debug('XML node:');
                    logger.debug(util.inspect(data));
                    return false;
                }
                else if (!(dataList instanceof Array)) {
                    console.log('Invalid node key ${key}');
                    return false;
                }
            }
        }
        return true;
    }
    else {
        return false;
    }
}


// support functions

// this is used for looping through the object keys
const dummyNode: IXmlNodeTerm = {
    'Content-UUID': [],
    'URL': [],
    'Term': [],
    'Definition': [{
        'p': [] 
    }],
    'Data-Type': [],
    'Unit-of-Measure': [],
    'Category': [],
    'Sector': [],
    'Application': [],
    'Updated-Date': [] 
}
