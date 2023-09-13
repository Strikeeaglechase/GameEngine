declare type ColorValue = number | string | Color | [
    number,
    number,
    number
] | [
    number,
    number,
    number,
    number
] | {
    r: number;
    b: number;
    g: number;
} | {
    r: number;
    b: number;
    g: number;
    a: number;
} | null | undefined;
declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(value?: ColorValue | null);
    get rgb(): string;
    get rgba(): string;
    get hex(): string;
    get arr(): [number, number, number, number];
    fromHex(hex: string): void;
    fromArr(arr: number[]): void;
    fromObject(obj: {
        r: number;
        g: number;
        b: number;
        a?: number;
    }): void;
    static random(): Color;
}
export { Color, ColorValue };
