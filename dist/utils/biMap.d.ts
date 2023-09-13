declare class BiMap<KeyType, ValueType> {
    private keyToValue;
    private valueToKey;
    get keys(): KeyType[];
    get values(): ValueType[];
    get pairs(): {
        key: KeyType;
        value: ValueType;
    }[];
    get size(): number;
    hasKey(key: KeyType): boolean;
    hasValue(value: ValueType): boolean;
    has(param: KeyType | ValueType): boolean;
    getByKey(key: KeyType): ValueType;
    getByValue(value: ValueType): KeyType;
    get(param: KeyType): ValueType;
    get(param: ValueType): KeyType;
    set(key: KeyType, value: ValueType): void;
    deleteByKey(key: KeyType): void;
    deleteByValue(value: ValueType): void;
    delete(param: KeyType | ValueType): void;
}
export { BiMap };
