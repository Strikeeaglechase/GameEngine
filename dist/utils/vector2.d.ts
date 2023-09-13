interface IVector2 {
    x: number;
    y: number;
}
declare class Vector2 {
    x: number;
    y: number;
    constructor(x?: number | IVector2, y?: number);
    negative(): this;
    add(v: IVector2 | number): this;
    subtract(v: IVector2 | number): this;
    multiply(v: IVector2 | number): this;
    divide(v: IVector2 | number): this;
    equals(v: IVector2): boolean;
    clone(): Vector2;
    dot(v: IVector2): number;
    cross(v: IVector2): number;
    length(): number;
    floor(): this;
    ceil(): this;
    round(): this;
    sqrLength(): number;
    normalize(): this;
    toAngle(): number;
    angleTo(a: Vector2): number;
    toArray(): [number, number];
    toString(): string;
    set(x: number | IVector2, y?: number): this;
    static get zero(): Vector2;
    static get random(): Vector2;
}
export { Vector2, IVector2 };
