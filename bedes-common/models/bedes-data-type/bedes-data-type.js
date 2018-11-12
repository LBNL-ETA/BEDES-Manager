"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BedesDataType {
    constructor(data) {
        this._id = data._id;
        this._name = data._name;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
}
exports.BedesDataType = BedesDataType;
