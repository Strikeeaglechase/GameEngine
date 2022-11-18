class BiMap<KeyType, ValueType> {
	private keyToValue: Map<KeyType, ValueType> = new Map();
	private valueToKey: Map<ValueType, KeyType> = new Map();

	public get keys(): KeyType[] {
		return [...this.valueToKey.values()];
	}

	public get values(): ValueType[] {
		return [...this.keyToValue.values()];
	}

	public get pairs(): { key: KeyType, value: ValueType; }[] {
		return this.keys.map(key => ({ key: key, value: this.getByKey(key) }));
	}

	public get size(): number {
		return this.keyToValue.size;
	}

	public hasKey(key: KeyType): boolean {
		return this.keyToValue.has(key);
	}

	public hasValue(value: ValueType): boolean {
		return this.valueToKey.has(value);
	}

	public has(param: KeyType | ValueType): boolean {
		return this.hasKey(param as KeyType) ?? this.hasValue(param as ValueType);
	}

	public getByKey(key: KeyType): ValueType {
		return this.keyToValue.get(key);
	}

	public getByValue(value: ValueType): KeyType {
		return this.valueToKey.get(value);
	}

	public get(param: KeyType): ValueType;
	public get(param: ValueType): KeyType;
	public get(param: KeyType | ValueType): KeyType | ValueType {
		return this.getByKey(param as KeyType) ?? this.getByValue(param as ValueType);
	}

	public set(key: KeyType, value: ValueType): void {
		this.keyToValue.set(key, value);
		this.valueToKey.set(value, key);
	}

	public deleteByKey(key: KeyType): void {
		this.valueToKey.delete(this.getByKey(key));
		this.keyToValue.delete(key);
	}

	public deleteByValue(value: ValueType): void {
		this.keyToValue.delete(this.getByValue(value));
		this.valueToKey.delete(value);
	}

	public delete(param: KeyType | ValueType): void {
		this.deleteByKey(param as KeyType);
		this.deleteByValue(param as ValueType);
	}
}

export { BiMap };