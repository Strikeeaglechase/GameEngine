var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { GameEngine } from "../engine.js";
import { Component, NetComponent } from "../entity/component.js";
import { Logger } from "../logger.js";
import { Color } from "../render/color.js";
import { GMath } from "../utils/gmath.js";
import { Vector2 } from "../utils/vector2.js";
const defaultOptions = {
    rate: null,
    lifetime: null,
    angle: null,
    speed: null,
    size: 5,
    rateJitter: 0,
    lifetimeJitter: 0,
    angleJitter: 0,
    speedJitter: 0,
    sizeJitter: 0,
    deceleration: 1,
    color: [255, 255, 255, 255],
    colorOptions: [],
    fadeTo: 255
};
function randV(value, jitter) {
    return value + (Math.random() - 0.5) * 2 * jitter;
}
class Particle {
    constructor(position, options) {
        this.options = options;
        this.alphaMult = 1;
        this.alphaOffset = 0;
        const angle = randV(options.angle, options.angleJitter);
        const speed = randV(options.speed, options.speedJitter);
        const lifetime = randV(options.lifetime, options.lifetimeJitter);
        this.size = randV(options.size, options.sizeJitter);
        this.position = position;
        this.velocity = new Vector2(Math.cos(GMath.rad(angle)) * speed, Math.sin(GMath.rad(angle)) * speed);
        this.lifetime = lifetime;
        this.alphaOffset = 255 - this.options.fadeTo;
        this.alphaMult = this.alphaOffset / this.lifetime;
        let col;
        if (this.options.colorOptions.length > 0) {
            col = this.options.colorOptions[Math.floor(Math.random() * this.options.colorOptions.length)];
        }
        else {
            col = this.options.color;
        }
        this.color = new Color(col);
    }
    update(dt) {
        this.position.add(this.velocity.clone().multiply(dt));
        this.velocity.multiply(this.options.deceleration);
        this.color.a = this.lifetime * this.alphaMult + (255 - this.alphaOffset);
        const renderer = GameEngine.instance.renderer;
        renderer.rect(this.position.x, this.position.y, this.size, this.size, this.color);
        this.lifetime -= dt;
    }
    isDead() {
        return this.lifetime <= 0;
    }
}
let ParticleEmitter = class ParticleEmitter extends Component {
    constructor(options) {
        super();
        this.offset = Vector2.zero;
        this.particles = [];
        this.nextEmitAt = Date.now();
        this.enabled = true;
        for (let key in defaultOptions) {
            if (defaultOptions[key] == null && options[key] == undefined) {
                Logger.error(`Missing option ${key} in PartialEmitter`);
                return;
            }
        }
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
    }
    update(dt) {
        const now = Date.now();
        if (now > this.nextEmitAt && this.enabled) {
            this.particles.push(new Particle(this.entity.transform.position.clone().add(this.offset), this.options));
            this.nextEmitAt = now + randV(this.options.rate * 1000, this.options.rateJitter * 1000);
        }
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => !p.isDead());
    }
};
ParticleEmitter = __decorate([
    NetComponent
], ParticleEmitter);
export { ParticleEmitter as PartialEmitter };
