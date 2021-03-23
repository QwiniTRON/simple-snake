import { Controller, Renderer } from "../Abstractions/Abstractions.js";
import { StoreEvents } from "../Data/Enums.js";
import { GameObjectType } from "../Data/Enums.js";
import { GameState } from "../State/GameStore.js";
import { GameEvent } from "../Abstractions/GameEvent.js";
import { KeyActionType } from "../State/KeyinputConfig.js";
import { ScoreIncrease, ScoreItems } from "../Data/Score.js";
import { SECOND } from '../Data/Time.js';
import { TransformOperations } from '../Data/Transform.js';
import { CellPosition } from '../Data/Position.js';
import { Direction, Directions } from "../Data/Direction.js";
import { Field } from "../Data/Field.js";

export const SnakeDirections = Directions;


const DirectionDegrees = new Map([
    [SnakeDirections.top, 90],
    [SnakeDirections.right, 0],
    [SnakeDirections.bottom, 270],
    [SnakeDirections.left, 180],
]);

/**
 * model
 */
class Snake {
    currentDirection = SnakeDirections.bottom;
    timeLeft = 0;

    constructor(snakeSpeed, size, initX, initY, color = '#0f0') {
        this.color = color;
        this.size = size;
        this.speed = snakeSpeed;

        this.body = [new CellPosition(initX, initY)];
    }

    step(timeMark, field, gameStore) {
        const timePerStep = SECOND / this.speed;

        this.timeLeft += timeMark.differentTime;

        if (this.timeLeft > timePerStep) {
            this.timeLeft = 0;

            this.moveBody(field, gameStore);
        }
    }

    moveBody(field, gameStore) {
        let lastCellPosition = this.body[0];
        let currentCell = this.body[0]
        let bodyCounter = 1;
        const nextFieldType = Field.getNextCellType(field, currentCell, this.currentDirection);

        // head move
        if (nextFieldType != GameObjectType.wall &&
            nextFieldType != GameObjectType.snake) {
            // clear the cell
            Field.clearFieldCell(field, currentCell);

            lastCellPosition = new CellPosition(currentCell.x, currentCell.y);

            if (nextFieldType == GameObjectType.apple) {
                this.addBody(field);

                this.chekWin(gameStore, field);

                this.increaseScore(gameStore, ScoreItems.Apple);
            }

            this.changePositionByDirection(currentCell);

            // mark the field's cell with a cell of the snake
            Field.markFieldCellSnake(field, currentCell);
        } else {
            // collision happend
            return this.emitGameOver(gameStore);
        }

        // body move
        while (bodyCounter < this.body.length) {
            currentCell = this.body[bodyCounter];

            Field.clearFieldCell(field, currentCell);

            CellPosition.swapPositions(currentCell, lastCellPosition);

            Field.markFieldCellSnake(field, currentCell);

            bodyCounter++;
        }
    }

    chekWin(gameStore, field) {
        let cellsToWin = field.length * field.length;
        cellsToWin -= (field.length - 2) * 4 + 4;

        if (cellsToWin == this.body.length) {
            return this.emitWin(gameStore);
        }
    }

    emitGameOver(gameStore) {
        return gameStore.emitNotice(new GameEvent(
            StoreEvents.RequestChangeState,
            GameState.GameOverMenu)
        );
    }

    emitWin(gameStore) {
        return gameStore.emitNotice(new GameEvent(
            StoreEvents.RequestChangeState,
            GameState.WinMenu)
        );
    }

    increaseScore(gameStore, eatenItem) {
        const scoreIncrease = ScoreIncrease.getScoreIncrease(eatenItem);
        gameStore.totalScore += scoreIncrease;
        gameStore.score += scoreIncrease;

        gameStore.emitNotice(new GameEvent(StoreEvents.changeScore));
    }

    // add new body piece
    addBody() {
        this.body[this.body.length] = new CellPosition(0, 0);
    }

    changePositionByDirection(currentCell) {
        Direction.performByDirection(
            () => currentCell.y--,
            () => currentCell.x++,
            () => currentCell.y++,
            () => currentCell.x--,
            this.currentDirection
        );
    }

    checkCollisionOnReturn(newDirection) {
        if (this.body.length == 1) return false;

        const isOpposite = Direction.isDirectionOpposite(this.currentDirection, newDirection);

        if (isOpposite) return isOpposite;

        const head = this.body[0];
        const neck = this.body[1];

        return Direction.performByDirection(
            () => neck.y == head.y - 1,
            () => neck.x == head.x + 1,
            () => neck.y == head.y + 1,
            () => neck.x == head.x - 1,
            newDirection
        );
    }
}

/**
 * controller
 */
export class SnakeController extends Controller {
    constructor(snakeSpeed, cellSize, initX, initY, keyboardActionProvider) {
        super();

        this.snake = new Snake(snakeSpeed, cellSize, initX, initY);
        this.snakeRender = new SnakeRender(this.snake);

        // keyinputs
        keyboardActionProvider.addListener((provider, event) => {
            if (KeyActionType.ChangeSnakeDirection == event.customDetails?.type) {
                const hasCollision = this.snake.checkCollisionOnReturn(
                    event.customDetails.direction
                );

                if (!hasCollision) {
                    this.snake.currentDirection = event.customDetails.direction;
                }
            }
        }, KeyActionType.ChangeSnakeDirection);
    }

    increaseSnakeSpeed(speedUp) {
        this.snake.speed += speedUp;
    }

    work(timeMark, context, field, gameStore) {
        if (!gameStore.isPaused()) {
            this.snake.step(timeMark, field, gameStore);
        }
        this.snakeRender.render(context, field);
    }
}

/**
 * view
 */
class SnakeRender extends Renderer {
    constructor(snake) {
        super();
        this.snake = snake;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context) {
        const cellSize = this.snake.size;

        this.setSnakeStyle(context);

        for (let i = 0; i < this.snake.body.length; i++) {
            this.renderSnakeCell(i, context, cellSize);
        }

        this.renderSnakeEyes(context);
        context.restore();
    }

    renderSnakeCell(i, context, cellSize) {
        const cell = this.snake.body[i];
        context.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        context.strokeRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    }

    setSnakeStyle(context) {
        context.fillStyle = this.snake.color;
        context.strokeStyle = '#000';
        context.lineWidth = 2;

        context.save();
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 10;
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.strokeStyle = '#030';
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    renderSnakeEyes(context) {
        context.fillStyle = '#f00';
        context.strokeStyle = '#000';
        context.lineWidth = 2;

        const cellSize = this.snake.size;
        const x = 0;
        const y = 0;
        const x1 = 0.8 * cellSize;
        const y1 = 0;
        const eyeSize = cellSize * 0.2

        this.rotateSnakeEyes(
            cellSize * this.snake.body[0].x,
            cellSize * this.snake.body[0].y,
            context,
            cellSize,
            eyeSize
        );

        context.fillRect(x, y, eyeSize, eyeSize);
        context.strokeRect(x, y, eyeSize, eyeSize);
        context.fillRect(x1, y1, eyeSize, eyeSize);
        context.strokeRect(x1, y1, eyeSize, eyeSize);

        context.resetTransform();
    }

    rotateSnakeEyes(centerX, centerY, context, cellSize, eyeSize) {
        Direction.performByDirection(
            () => TransformOperations.rotateOnPosition(
                centerX,
                centerY,
                0,
                context
            ),
            () => TransformOperations.rotateOnPosition(
                centerX + cellSize - eyeSize,
                centerY + cellSize,
                TransformOperations.toRad(270),
                context
            ),
            () => TransformOperations.rotateOnPosition(
                centerX + cellSize,
                centerY + cellSize,
                TransformOperations.toRad(180),
                context
            ),
            () => TransformOperations.rotateOnPosition(
                centerX + eyeSize,
                centerY,
                TransformOperations.toRad(90),
                context
            ),
            this.snake.currentDirection
        );
    }
}

