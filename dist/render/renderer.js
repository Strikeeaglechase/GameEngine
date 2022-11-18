import { Logger } from "../logger.js";
import { GMath } from "../utils/gmath.js";
import { Color } from "./color.js";
class Renderer {
    constructor(canvasId) {
        this.transformStack = [];
        this.prevArgs = { x: 0, y: 0, w: 0, h: 0 };
        this.width = 0;
        this.height = 0;
        this.canvas = document.getElementById(canvasId !== null && canvasId !== void 0 ? canvasId : "main");
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error(`Unable to resolve canvas rendering context`);
        }
        this.ctx = context;
        this.ctx.font = `12pt Anonymous Pro, monospace`;
        Logger.info(`Renderer initialized, using canvas ${this.canvas.id}`);
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        Logger.debug(`Resized canvas to ${width}x${height}`);
    }
    clear(c) {
        this.ctx.fillStyle = new Color(c).hex;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    parseArgs(args) {
        // Allowed formats:
        // [color]
        // [x,y,w]
        // [x,y,w,color]
        // [x,y,w,h]
        // [x,y,w,h,color]
        let ret;
        if (args.length == 0) {
            ret = Object.assign(Object.assign({}, this.prevArgs), { c: null });
        }
        else if (typeof args[0] == "object") {
            ret = Object.assign(Object.assign({}, this.prevArgs), { c: args[0] });
        }
        else if (args.length == 3) {
            ret = {
                x: args[0],
                y: args[1],
                w: args[2],
                h: args[2],
                c: null
            };
        }
        else if (typeof args[3] == "object") {
            ret = {
                x: args[0],
                y: args[1],
                w: args[2],
                h: args[2],
                c: args[3]
            };
        }
        else if (args.length == 4) {
            ret = {
                x: args[0],
                y: args[1],
                w: args[2],
                h: args[3],
                c: null
            };
        }
        else {
            ret = {
                x: args[0],
                y: args[1],
                w: args[2],
                h: args[3],
                c: args[4]
            };
        }
        this.prevArgs = ret;
        return ret;
    }
    rect(...args) {
        const { x, y, w, h, c } = this.parseArgs(args);
        this.ctx.fillStyle = new Color(c).hex;
        this.ctx.fillRect(x, y, w, h);
    }
    strokeRect(...args) {
        const { x, y, w, h, c } = this.parseArgs(args);
        this.ctx.strokeStyle = new Color(c).hex;
        this.ctx.strokeRect(x, y, w, h);
    }
    roundedRect(pixels, ...args) {
        const { x, y, w, h, c } = this.parseArgs(args);
        this.ctx.fillStyle = new Color(c).hex;
        this.ctx.beginPath();
        // this.ctx.roundRect();
        // this.ctx(x, y, w, h);
    }
    ellipse(...args) {
        const { x, y, w, h, c } = this.parseArgs(args);
        this.ctx.fillStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    strokeEllipse(...args) {
        const { x, y, w, h, c } = this.parseArgs(args);
        this.ctx.strokeStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    dashedEllipse(x, y, w, h, dash, c) {
        this.ctx.strokeStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.setLineDash(dash);
        this.ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    line(x, y, x2, y2, c) {
        this.ctx.strokeStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    text(msg, x, y, c, fontSize) {
        if (fontSize) {
            this.ctx.font = typeof fontSize == "number" ? `${fontSize}pt Anonymous Pro, monospace` : fontSize;
        }
        else {
            this.ctx.font = "12pt Anonymous Pro, monospace";
        }
        this.ctx.fillStyle = new Color(c).hex;
        this.ctx.fillText(msg, x, y);
    }
    measureText(msg, fontSize) {
        if (fontSize) {
            this.ctx.font = typeof fontSize == "number" ? `${fontSize}pt Anonymous Pro, monospace` : fontSize;
        }
        else {
            this.ctx.font = "12pt Anonymous Pro, monospace";
        }
        return this.ctx.measureText(msg).width;
    }
    transform(x, y, r) {
        this.ctx.translate(x, y);
        this.ctx.rotate(GMath.rad(r));
        this.transformStack.push({ x, y, r });
    }
    revert() {
        const transform = this.transformStack.pop();
        if (!transform)
            return;
        this.ctx.rotate(GMath.rad(-transform.r));
        this.ctx.translate(-transform.x, -transform.y);
    }
    debugObject(obj, x, y, c) {
        const maxKeyLength = Math.max(...Object.keys(obj).map(s => s.length));
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] == "object") {
                if (!Array.isArray(obj[key])) {
                    this.text(key, x, y, c);
                    y += 15;
                    y = this.debugObject(obj[key], x + 15, y, c);
                }
                else {
                    if (typeof obj[key][0] != "object") {
                        const str = obj[key].join(", ");
                        this.text(`${key.padEnd(maxKeyLength)}: [${str}]`, x, y, c);
                    }
                    else {
                        this.text(`${key}[${obj[key].length}]`, x, y, c);
                    }
                    y += 15;
                }
            }
            else {
                this.text(`${key.padEnd(maxKeyLength)}: ${obj[key]}`, x, y, c);
                y += 15;
            }
        });
        return y;
    }
    point(x, y, c) {
        this.rect(x, y, 1, 1, c);
    }
    roundCornerRect(x, y, w, h, r, c) {
        let xOffsetStart = x + r;
        let xOffsetEnd = x + w - r;
        let yOffsetStart = y + r;
        let yOffsetEnd = y + h - r;
        this.rect(xOffsetStart, y, w - (2 * r), h, c); //x axis rect
        this.rect(x, yOffsetStart, w, h - (2 * r), c); //y axis rect
        this.ellipse(xOffsetStart, yOffsetStart, r, c); //top left corner
        this.ellipse(xOffsetEnd, yOffsetStart, r, c); //top right corner
        this.ellipse(xOffsetStart, yOffsetEnd, r, c); //bottom left corner
        this.ellipse(xOffsetEnd, yOffsetEnd, r, c); //bottom right corner
    }
    strokeRoundCornerRect(x, y, w, h, r, c) {
        let xOffsetStart = x + r;
        let xOffsetEnd = x + w - r;
        let yOffsetStart = y + r;
        let yOffsetEnd = y + h - r;
        this.strokeRect(xOffsetStart, y, w - (2 * r), h, c); //x axis rect
        this.strokeRect(x, yOffsetStart, w, h - (2 * r), c); //y axis rect
        this.strokeEllipse(xOffsetStart, yOffsetStart, r, c); //top left corner
        this.strokeEllipse(xOffsetEnd, yOffsetStart, r, c); //top right corner
        this.strokeEllipse(xOffsetStart, yOffsetEnd, r, c); //bottom left corner
        this.strokeEllipse(xOffsetEnd, yOffsetEnd, r, c); //bottom right corner
    }
    path(points, c) {
        this.ctx.strokeStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(element => {
            this.ctx.moveTo(element.x, element.y);
        });
        this.ctx.stroke();
    }
    triangle(x1, y1, x2, y2, x3, y3, c) {
        this.ctx.fillStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.moveTo(x2, y2);
        this.ctx.moveTo(x3, y3);
        this.ctx.fill();
    }
    strokeTriangle(x1, y1, x2, y2, x3, y3, c) {
        this.ctx.strokeStyle = new Color(c).hex;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.moveTo(x2, y2);
        this.ctx.moveTo(x3, y3);
        this.ctx.stroke();
    }
    strokeWidth(w) {
        this.ctx.lineWidth = w;
    }
}
export { Renderer };
