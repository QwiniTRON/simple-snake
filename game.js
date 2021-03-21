import { GameObjectType } from './logick/Data/Enums.js';
import { InventorController } from './logick/Controllers/Inventor.js';
import { KeyboardActionProvider } from './logick/State/KeyinputConfig.js';
import { SnakeController } from './logick/Controllers/Snake.js';
import { GameState, GameStore } from './logick/State/GameStore.js';
import { ScoreController } from './logick/Controllers/Score.js';
import { StoreEvents } from './logick/Data/Enums.js';
import { MenusController } from './logick/Controllers/Menu.js';
import { LayoutController } from './logick/Controllers/Layout.js';
import { FrameRender } from './logick/Data/FrameRender.js';
import { config, keyboardConfig } from './logick/config.js';
import { TimeMark } from './logick/Data/Time.js';
import { ScoreCalcuate } from './logick/Data/Score.js';

const gameFieldId = 'game';
const gameField = document.getElementById(gameFieldId);
const context = gameField.getContext('2d');
const fullWidth = gameField.width = 800,
    width = 600,
    height = gameField.height = 600;


class Game {
    constructor(config, keyboardConfig, context) {
        this.config = config;
        this.frameRenderController = new FrameRender(0, this.config.fps);
        this.keyboardConfig = keyboardConfig;
        this.context = context;
        this.lastTime = 0;

        this.cellSize = width / config.size;

        this.body = [];
        for (let i = 0; i < this.config.size; i++) {
            this.body[i] = [];
            for (let j = 0; j < this.config.size; j++) {
                let objectType = GameObjectType.empty;
                // create walls
                if (i == 0 || i == this.config.size - 1 || j == 0 || j == this.config.size - 1) {
                    objectType = GameObjectType.wall;
                }

                this.body[i][j] = objectType;
            }
        }
    }

    Init() {
        // init snake position
        const middle = Math.ceil(this.config.size / 2);
        this.body[middle][middle] = GameObjectType.snake;

        this.gameStore = new GameStore();
        this.keyboardActionProvider = new KeyboardActionProvider(keyboardConfig);


        this.snake = new SnakeController(
            this.config.snakeSpeed,
            this.cellSize,
            middle,
            middle,
            this.keyboardActionProvider
        );

        this.inventor = new InventorController(fullWidth, height, this.cellSize);

        this.layoutController = new LayoutController(fullWidth, height);

        this.scoreManager = new ScoreController(fullWidth - width, width);

        this.menusController = new MenusController(
            this.gameStore,
            this.keyboardActionProvider
        );


        // listeners
        // score change
        this.gameStore.addListener(() => {
            const oldLevel = this.gameStore.level;

            const newScoreData = ScoreCalcuate.calculateUserScore(
                this.gameStore.score,
                this.gameStore.level
            );

            this.gameStore.score = newScoreData[0];
            this.gameStore.level = newScoreData[1];

            if (oldLevel < this.gameStore.level) {
                this.snake.increaseSnakeSpeed(this.gameStore.level - oldLevel);
            }
        }, StoreEvents.changeScore);

        this.gameStore.addListener((store, event) => {
            this.gameStore.gameState = event.customDetails;

            if (event.customDetails == GameState.Game) {
                this.gameStore.gameState = GameState.Wait;
                setTimeout(() => this.gameStore.gameState = GameState.Game, 3000);
            }
        }, StoreEvents.RequestChangeState);

        // keyboard
        document.addEventListener('keydown', this.keyboardActionProvider);

        window.requestAnimationFrame(this.renderFrame.bind(this));
    }

    getCurrentTimeMark(time) {
        const framesForRender = this.frameRenderController.countFramesOnRender(time);
        const timedifferent = time - this.lastTime;
        this.lastTime = time;

        return new TimeMark(time, timedifferent, framesForRender);
    }

    renderFrame(time) {

        const timeMark = this.getCurrentTimeMark(time);

        this.layoutController.work(timeMark, context, this.body, this.gameStore);

        this.menusController.work(
            timeMark,
            context,
            this.body,
            this.gameStore
        );

        this.snake.work(
            timeMark,
            context,
            this.body,
            this.gameStore
        );
        this.inventor.work(timeMark, context, this.body, this.gameStore);
        this.scoreManager.work(timeMark, context, this.body, this.gameStore);

        window.requestAnimationFrame(this.renderFrame.bind(this));
    }
}

const game = new Game(config, keyboardConfig, context);
game.Init();