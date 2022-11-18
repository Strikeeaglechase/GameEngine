interface IVector2 {
	x: number;
	y: number;
}

function isVector(v: any): v is IVector2 {
	return typeof v == "object" && v.x != null && v.y != null && v.x != null;
}

class Vector2 {
	public x = 0;
	public y = 0;

	constructor(x?: number | IVector2, y?: number) {
		if (isVector(x)) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x ?? 0;
			this.y = y ?? 0;
		}
	}

	public negative(): this {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}

	public add(v: IVector2 | number): this {
		if (isVector(v)) {
			this.x += v.x;
			this.y += v.y;
		} else {
			this.x += v;
			this.y += v;
		}
		return this;
	}

	public subtract(v: IVector2 | number): this {
		if (isVector(v)) {
			this.x -= v.x;
			this.y -= v.y;
		} else {
			this.x -= v;
			this.y -= v;
		}
		return this;
	}

	public multiply(v: IVector2 | number): this {
		if (isVector(v)) {
			this.x *= v.x;
			this.y *= v.y;
		} else {
			this.x *= v;
			this.y *= v;
		}
		return this;
	}

	public divide(v: IVector2 | number): this {
		if (isVector(v)) {
			this.x /= v.x;
			this.y /= v.y;
		} else {
			this.x /= v;
			this.y /= v;
		}
		return this;
	}

	public equals(v: IVector2): boolean {
		return this.x == v.x && this.y == v.y;
	}

	public clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	public dot(v: IVector2): number {
		return this.x * v.x + this.y * v.y;
	}

	public cross(v: IVector2): number {
		return this.x * v.y - this.y * v.x;
	}

	public length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	public floor(): this {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	public ceil(): this {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}

	public round(): this {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}

	public sqrLength(): number {
		return this.x * this.x + this.y * this.y;
	}

	public normalize(): this {
		let len = this.length();
		if (len == 0) return this;
		this.x /= len;
		this.y /= len;
		return this;
	}

	public toAngle(): number {
		return Math.atan2(this.y, this.x);
	}

	public angleTo(a: Vector2): number {
		return Math.acos(this.dot(a) / (this.length() * a.length()));
	}

	public toArray(): [number, number] {
		return [this.x, this.y];
	}

	public toString() {
		return `Vec2(${this.x}, ${this.y})`;
	}

	public set(x: number | IVector2, y?: number): this {
		if (isVector(x)) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
		return this;
	}

	public static get zero(): Vector2 {
		return new Vector2(0, 0);
	}

	public static get random(): Vector2 {
		return new Vector2(Math.random(), Math.random());
	}
}

export { Vector2, IVector2 };