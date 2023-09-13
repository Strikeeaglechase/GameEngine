import { Vector2 } from "./utils/vector2.js";
export interface MouseMoveEvent {
    previous: Vector2;
    current: Vector2;
}
export interface MouseDownEvent {
    position: Vector2;
    button: number;
}
export interface MouseUpEvent {
    position: Vector2;
    button: number;
}
export interface KeyDownEvent {
    key: string;
}
export interface KeyUpEvent {
    key: string;
}
