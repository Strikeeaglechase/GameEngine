import { GameEngine } from "../engine.js";
import { Component, NetComponent } from "../entity/component.js";
import { Logger } from "../logger.js";
import { Color, ColorValue } from "../render/color.js";
import { GMath } from "../utils/gmath.js";
import { Vector2 } from "../utils/vector2.js";

interface ParticleEmitterOptions {
	rate: number;
	rateJitter: number;

	lifetime: number;
	lifetimeJitter: number;

	angle: number;
	angleJitter: number;

	speed: number;
	speedJitter: number;

	size: number;
	sizeJitter: number;

	deceleration: number;
	color: ColorValue;
	colorOptions: ColorValue[];
	fadeTo: number;
}

const defaultOptions: ParticleEmitterOptions = {
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

function randV(value: number, jitter: number) {
	return value + (Math.random() - 0.5) * 2 * jitter;
}

class Particle {
	private position: Vector2;
	private velocity: Vector2;
	private lifetime: number;
	private color: Color;
	private size: number;
	private alphaMult = 1;
	private alphaOffset = 0;

	constructor(position: Vector2, private options: ParticleEmitterOptions) {
		const angle = randV(options.angle, options.angleJitter);
		const speed = randV(options.speed, options.speedJitter);
		const lifetime = randV(options.lifetime, options.lifetimeJitter);
		this.size = randV(options.size, options.sizeJitter);

		this.position = position;
		this.velocity = new Vector2(Math.cos(GMath.rad(angle)) * speed, Math.sin(GMath.rad(angle)) * speed);
		this.lifetime = lifetime;

		this.alphaOffset = 255 - this.options.fadeTo;
		this.alphaMult = this.alphaOffset / this.lifetime;

		let col: ColorValue;
		if (this.options.colorOptions.length > 0) {
			col = this.options.colorOptions[Math.floor(Math.random() * this.options.colorOptions.length)];
		} else {
			col = this.options.color;
		}
		this.color = new Color(col);
	}

	public update(dt: number) {
		this.position.add(this.velocity.clone().multiply(dt));
		this.velocity.multiply(this.options.deceleration);

		this.color.a = this.lifetime * this.alphaMult + (255 - this.alphaOffset);
		const renderer = GameEngine.instance.renderer;
		renderer.rect(this.position.x, this.position.y, this.size, this.size, this.color);

		this.lifetime -= dt;
	}

	public isDead() {
		return this.lifetime <= 0;
	}
}

@NetComponent
class ParticleEmitter extends Component {
	public offset = Vector2.zero;
	public options: ParticleEmitterOptions;
	private particles: Particle[] = [];
	private nextEmitAt = Date.now();
	public enabled = true;

	constructor(options: Partial<ParticleEmitterOptions>) {
		super();
		for (let key in defaultOptions) {
			if (defaultOptions[key] == null && options[key] == undefined) {
				Logger.error(`Missing option ${key} in PartialEmitter`);
				return;
			}
		}

		this.options = { ...defaultOptions, ...options };
	}

	public override update(dt: number) {
		const now = Date.now();
		if (now > this.nextEmitAt && this.enabled) {
			this.particles.push(new Particle(this.entity.transform.position.clone().add(this.offset), this.options));
			this.nextEmitAt = now + randV(this.options.rate * 1000, this.options.rateJitter * 1000);
		}

		this.particles.forEach(p => p.update(dt));
		this.particles = this.particles.filter(p => !p.isDead());
	}
}

export { ParticleEmitter as PartialEmitter, ParticleEmitterOptions as PartialEmitterOptions };