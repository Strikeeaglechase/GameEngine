const numToHex = (value) => {
    const r = Math.floor(value).toString(16);
    return r.length == 2 ? r : "0" + r;
};
class Color {
    constructor(value) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 255;
        if (value == undefined || value == null)
            value = 0;
        switch (typeof value) {
            case "number":
                this.r = value;
                this.g = value;
                this.b = value;
                break;
            case "string":
                this.fromHex(value);
                break;
            case "object":
                if (Array.isArray(value)) {
                    this.fromArr(value);
                }
                else {
                    this.fromObject(value);
                }
                break;
        }
    }
    get rgb() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }
    get rgba() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
    get hex() {
        return `#${this.arr.map(numToHex).join("")}`;
    }
    get arr() {
        return [this.r, this.g, this.b, this.a];
    }
    fromHex(hex) {
        this.r = parseInt(hex[1] + hex[2], 16);
        this.g = parseInt(hex[3] + hex[4], 16);
        this.b = parseInt(hex[5] + hex[6], 16);
        if (hex.length == 9)
            this.a = parseInt(hex[7] + hex[8], 16);
    }
    fromArr(arr) {
        this.r = arr[0];
        this.g = arr[1];
        this.b = arr[2];
        if (arr[3] != undefined)
            this.a = arr[3];
    }
    fromObject(obj) {
        this.r = obj.r;
        this.g = obj.g;
        this.b = obj.b;
        if (obj.a != undefined)
            this.a = obj.a;
    }
    static random() {
        return new Color([Math.random() * 255, Math.random() * 255, Math.random() * 255]);
    }
}
export { Color };
