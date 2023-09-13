import { LocalOnlyComponent } from "../../components/localOnlyComponent.js";
declare class CubeKeybinds extends LocalOnlyComponent {
    private physics;
    private lastFireTime;
    awake(): boolean;
    update(dt: number): void;
    private fire;
}
export { CubeKeybinds };
