"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bedes_term_1 = require("./bedes-term");
const bedes_term_option_1 = require("../bedes-term-option/bedes-term-option");
class BedesConstrainedList extends bedes_term_1.BedesTerm {
    constructor(data) {
        super(data);
        this._options = new Array();
        if (data._options && data._options.length) {
            this.loadOptions(data._options);
        }
    }
    /**
     * Returns the array of Term Options
     */
    get options() {
        return this._options;
    }
    /**
     * Loads the options for the BedesTermConstrainedList.
     * @param options
     */
    loadOptions(options) {
        options.map((d) => this._options.push(new bedes_term_option_1.BedesTermOption(d)));
    }
    /**
     * Adds BedesTermOption to the Constrained List.
     * @param option
     */
    addOption(termOption) {
        return __awaiter(this, void 0, void 0, function* () {
            this._options.push(termOption);
        });
    }
}
exports.BedesConstrainedList = BedesConstrainedList;
