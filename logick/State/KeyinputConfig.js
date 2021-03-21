import { Listenable } from '../Abstractions/Listenable.js';
import { GameEvent } from '../Abstractions/GameEvent.js';

export const KeyActionType = {
    ChangeSnakeDirection: 0,
    ToggleMenu: 1,
}

export class CnageSnakeDirectionKeyAction {
    /**
     * takes SnakeDirections
     * 
     * @param {SnakeDirection} direction 
     */
    constructor(direction) {
        if (direction == undefined) {
            throw new Error("direction must be!");
        }

        this.direction = direction;
        this.type = KeyActionType.ChangeSnakeDirection;
    }
}

export class ToggleMenuAction {
    constructor() {
        this.type = KeyActionType.ToggleMenu;
    }
}

export class KeyboardActionProvider extends Listenable {
    constructor(keyboardConfig) {
        super();

        this.keyboardConfig = keyboardConfig;
    }

    handleEvent(e) {
        const keyboardAction = this.keyboardConfig.get(e.code);

        if (keyboardAction) {
            this.emitNotice(new GameEvent(keyboardAction.type, keyboardAction));
        }
    }
}
