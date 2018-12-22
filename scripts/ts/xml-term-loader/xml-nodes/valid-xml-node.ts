import { IXmlNode } from './xml-node.interface';
import { validXmlNodeDefinition } from './valid-xml-node-definition';

/**
 * Examines an object and determines if it implements the IXmlNode interface correctly.
 */
export function validXmlNode(data: IXmlNode): boolean {
    if (data instanceof Object) {
        for (let key of Object.keys(dummyNode)) {
            // @ts-ignore
            const dataList = data[(key)];
            if (dataList) {
                if (key === 'Definition' && !validXmlNodeDefinition(dataList)) {
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
const dummyNode: IXmlNode = {
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
