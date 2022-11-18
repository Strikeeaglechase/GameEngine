class BiMap {
    constructor() {
        this.keyToValue = new Map();
        this.valueToKey = new Map();
    }
    get keys() {
        return [...this.valueToKey.values()];
    }
    get values() {
        return [...this.keyToValue.values()];
    }
    get pairs() {
        return this.keys.map(key => ({ key: key, value: this.getByKey(key) }));
    }
    get size() {
        return this.keyToValue.size;
    }
    hasKey(key) {
        return this.keyToValue.has(key);
    }
    hasValue(value) {
        return this.valueToKey.has(value);
    }
    has(param) {
        var _a;
        return (_a = this.hasKey(param)) !== null && _a !== void 0 ? _a : this.hasValue(param);
    }
    getByKey(key) {
        return this.keyToValue.get(key);
    }
    getByValue(value) {
        return this.valueToKey.get(value);
    }
    get(param) {
        var _a;
        return (_a = this.getByKey(param)) !== null && _a !== void 0 ? _a : this.getByValue(param);
    }
    set(key, value) {
        this.keyToValue.set(key, value);
        this.valueToKey.set(value, key);
    }
    deleteByKey(key) {
        this.valueToKey.delete(this.getByKey(key));
        this.keyToValue.delete(key);
    }
    deleteByValue(value) {
        this.keyToValue.delete(this.getByValue(value));
        this.valueToKey.delete(value);
    }
    delete(param) {
        this.deleteByKey(param);
        this.deleteByValue(param);
    }
}
export { BiMap };
