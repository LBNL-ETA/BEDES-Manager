"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BedesTerm {
    constructor(data) {
        this._id = data._id;
        this._termTypeId = data._termTypeId;
        this._name = data._name;
        this._description = data._description;
        this._dataTypeId = data._dataTypeId;
        this._unitId = data._unitId;
        this._definitionSourceId = data._definitionSourceId;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get termTypeId() {
        return this._termTypeId;
    }
    set termTypeId(value) {
        this._termTypeId = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get dataTypeId() {
        return this._dataTypeId;
    }
    set dataTypeId(value) {
        this._dataTypeId = value;
    }
    get unitId() {
        return this._unitId;
    }
    set unitId(value) {
        this._unitId = value;
    }
    get definitionSourceId() {
        return this._definitionSourceId;
    }
    set definitionSourceId(value) {
        this._definitionSourceId = value;
    }
}
exports.BedesTerm = BedesTerm;
