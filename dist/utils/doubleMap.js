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
        return this.hasKey(param) || this.hasValue(param);
    }
    getByKey(key) {
        return this.keyToValue.get(key);
    }
    getByValue(value) {
        return this.valueToKey.get(value);
    }
}
