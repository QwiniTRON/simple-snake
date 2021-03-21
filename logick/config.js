import { SnakeDirections } from "./Controllers/Snake.js";
import { CnageSnakeDirectionKeyAction, ToggleMenuAction } from "./State/KeyinputConfig.js";

export const config = {
    fps: 60,
    // 2 moves per second -> 1000 / 2 on step
    snakeSpeed: 2,
    size: 20
}

// control settings
export const keyboardConfig = new Map();
keyboardConfig.set('KeyA', new CnageSnakeDirectionKeyAction(SnakeDirections.left));
keyboardConfig.set('KeyW', new CnageSnakeDirectionKeyAction(SnakeDirections.top));
keyboardConfig.set('KeyD', new CnageSnakeDirectionKeyAction(SnakeDirections.right));
keyboardConfig.set('KeyS', new CnageSnakeDirectionKeyAction(SnakeDirections.bottom));
keyboardConfig.set('Escape', new ToggleMenuAction());