function isVector(v) {
    return typeof v == "object" && v.x != null && v.y != null && v.x != null;
}
class Vector2 {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        if (isVector(x)) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x !== null && x !== void 0 ? x : 0;
            this.y = y !== null && y !== void 0 ? y : 0;
        }
    }
    negative() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    add(v) {
        if (isVector(v)) {
            this.x += v.x;
            this.y += v.y;
        }
        else {
            this.x += v;
            this.y += v;
        }
        return this;
    }
    subtract(v) {
        if (isVector(v)) {
            this.x -= v.x;
            this.y -= v.y;
        }
        else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }
    multiply(v) {
        if (isVector(v)) {
            this.x *= v.x;
            this.y *= v.y;
        }
        else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    }
    divide(v) {
        if (isVector(v)) {
            this.x /= v.x;
            this.y /= v.y;
        }
        else {
            this.x /= v;
            this.y /= v;
        }
        return this;
    }
    equals(v) {
        return this.x == v.x && this.y == v.y;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }
    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
    sqrLength() {
        return this.x * this.x + this.y * this.y;
    }
    normalize() {
        let len = this.length();
        if (len == 0)
            return this;
        this.x /= len;
        this.y /= len;
        return this;
    }
    toAngle() {
        return Math.atan2(this.y, this.x);
    }
    angleTo(a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray() {
        return [this.x, this.y];
    }
    toString() {
        return `Vec2(${this.x}, ${this.y})`;
    }
    set(x, y) {
        if (isVector(x)) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y;
        }
        return this;
    }
    static get zero() {
        return new Vector2(0, 0);
    }
    static get random() {
        return new Vector2(Math.random(), Math.random());
    }
}
export { Vector2 };
