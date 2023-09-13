import { Component } from "../entity/component.js";
import { ColorValue } from "../render/color.js";
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
declare class ParticleEmitter extends Component {
    offset: Vector2;
    options: ParticleEmitterOptions;
    private particles;
    private nextEmitAt;
    enabled: boolean;
    constructor(options: Partial<ParticleEmitterOptions>);
    update(dt: number): void;
}
export { ParticleEmitter as PartialEmitter, ParticleEmitterOptions as PartialEmitterOptions };
