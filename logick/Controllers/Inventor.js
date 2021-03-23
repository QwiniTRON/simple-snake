import { Controller, Renderer } from "../Abstractions/Abstractions.js";
import { GameObjectType } from "../Data/Enums.js";
import { Field } from "../Data/Field.js";
import { CellPosition } from "../Data/Position.js";
import { GameState } from '../State/GameStore.js';

export class InventorModel {
    constructor() {
        this.leftTime = 0;
    }

    generateApple(timeMark, field) {
        const timeToSpawnApple = 3000 + Math.round(2000 * Math.random());
        this.leftTime += timeMark.differentTime;

        if (this.leftTime >= timeToSpawnApple) {
            this.leftTime = 0;

            const place = this.getRandomPlace(field);

            field[place.y][place.x] = GameObjectType.apple;
        }
    }

    getRandomPlace(field) {
        const places = Field.getClearPlaces(field);

        return places[Math.floor(Math.random() * places.length)];
    }
}

export class InventorRender extends Renderer {
    constructor(width, height, cellSize) {
        super();

        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context, field, cellSize, isWait) {
        // walls
        context.fillStyle = '#ff0';
        context.strokeStyle = '#000';
        context.lineWidth = 1;

        for (let i = 0; i < field.length; i++) {
            // top
            context.fillRect(i * this.cellSize, 0, this.cellSize, this.cellSize);
            context.strokeRect(i * this.cellSize, 0, this.cellSize, this.cellSize);

            // bottom
            context.fillRect(i * this.cellSize,
                (field.length - 1) * this.cellSize,
                this.cellSize,
                this.cellSize);
            context.strokeRect(i * this.cellSize,
                (field.length - 1) * this.cellSize,
                this.cellSize,
                this.cellSize);

            // right
            context.fillRect((field.length - 1) * this.cellSize,
                i * this.cellSize,
                this.cellSize,
                this.cellSize);
            context.strokeRect((field.length - 1) * this.cellSize,
                i * this.cellSize,
                this.cellSize,
                this.cellSize);

            // left
            context.fillRect(0, i * this.cellSize, this.cellSize, this.cellSize);
            context.strokeRect(0, i * this.cellSize, this.cellSize, this.cellSize);
        }

        // apples
        for (let i = 0; i < field.length - 1; i++) {
            for (let j = 1; j < field[i].length - 1; j++) {
                const currentCell = field[j][i];

                if (currentCell == GameObjectType.apple) {
                    context.save();
                    context.fillStyle = 'pink';
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;
                    context.shadowBlur = 10;
                    context.shadowColor = 'rgba(255, 100, 100, 0.9)';
                    context.strokeStyle = '#030';
                    context.fillRect(cellSize * i, cellSize * j, cellSize, cellSize);
                    context.strokeRect(cellSize * i, cellSize * j, cellSize, cellSize);
                    context.restore();
                }
            }
        }

        // handle for wait state
        if (isWait) {
            context.save();
            context.fillStyle = 'red';
            context.strokeStyle = 'red';
            context.lineWidth = 3;
            context.lineCap = 'round';
            context.font = '300 64px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            context.fillText("Начинаем", this.width / 2, this.height / 2);
            context.strokeText("Начинаем", this.width / 2, this.height / 2);
            context.restore();
        }
    }
}

export class InventorController extends Controller {
    constructor(fieldWidth, fieldHeight, cellSize) {
        super();

        this.cellSize = cellSize;
        this.fieldWidth = fieldWidth;
        this.fieldHeight = fieldHeight;
        this.inventor = new InventorModel();
        this.inventorRender = new InventorRender(this.fieldWidth, this.fieldHeight, cellSize);
    }

    work(timeMark, context, field, gameStore) {
        if (!gameStore.isPaused()) {
            this.inventor.generateApple(timeMark, field);
        }

        this.inventorRender.render(
            context,
            field,
            this.cellSize,
            gameStore.gameState == GameState.Wait
        );
    }
}