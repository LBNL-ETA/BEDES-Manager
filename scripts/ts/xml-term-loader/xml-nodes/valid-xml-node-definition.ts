import { IXmlDefinition } from './xml-definition.interface';

export function validXmlNodeDefinition(data: IXmlDefinition): boolean {
    if (data instanceof Array && data.length === 1 && data[0]['p'] instanceof Array) {
        return true;
    }
    else {
        return false;
    }
}
