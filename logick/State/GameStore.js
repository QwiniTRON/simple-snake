import { Listenable } from "../Abstractions/Listenable.js";

export class GameStore extends Listenable {
    constructor() {
        super();

        this.score = 0;
        this.totalScore = 0;
        this.level = 1;

        this.gameState = GameState.StartMenu;
    }

    isPaused() {
        return this.gameState != GameState.Game;
    }
}

export const GameState = {
    PauseMenu: 0,
    StartMenu: 1,
    Game: 2,
    GameOverMenu: 3,
    Wait: 4,
    WinMenu: 5,
};