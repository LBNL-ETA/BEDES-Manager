import { IXmlNodeTermOption } from './xml-node-term-option.interface';

/**
 * Examines an object and determines if it implements the IXmlNode interface correctly.
 */
export function validXmlNode(data: IXmlNodeTermOption): boolean {
    if (typeof data === 'object' && data !== null) {
        for (let key of Object.keys(dummyNode)) {
            // @ts-ignore
            const dataList = data[key];
            if (dataList) {
                if (!(dataList instanceof Array)) {
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
const dummyNode: IXmlNodeTermOption = {
    'Content-UUID': [],
    'URL': [],
    'List-Option': [],
    'List-Option-Definition': [],
    'Unit-of-Measure': [],
    'Related-Term': [],
    'Related-Term-UUID': [],
    'Sector': [],
    'Application': [],
    'Updated-Date': [] 
}
