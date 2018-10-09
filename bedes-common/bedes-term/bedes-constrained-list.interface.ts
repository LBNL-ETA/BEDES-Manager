import { IBedesTerm } from "./bedes-term.interface";
import { IBedesTermOption } from "../bedes-term-option/bedes-term-option.interface";

export interface IBedesTermConstrainedList extends IBedesTerm {
    _options: Array<IBedesTermOption>;
}
