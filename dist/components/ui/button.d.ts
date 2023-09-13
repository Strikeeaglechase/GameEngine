import { Component } from "../../entity/component.js";
declare class Button extends Component {
    private onClick;
    updateToText: boolean;
    constructor(onClick: () => void, updateToText?: boolean);
    awake(): void;
    update(dt: number): void;
}
export { Button };
