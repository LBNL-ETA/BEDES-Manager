import { IXmlDefinition } from './xml-definition.interface';

export interface IXmlNodeTerm {
    'Content-UUID': Array<string>;
    'URL': Array<string>;
    'Term': Array<string>;
    'Definition': Array<IXmlDefinition>;
    'Data-Type': Array<string>;
    'Unit-of-Measure': Array<string>;
    'Category': Array<string>;
    'Sector': Array<string>;
    'Application': Array<string>;
    'Updated-Date': Array<string>;
}
