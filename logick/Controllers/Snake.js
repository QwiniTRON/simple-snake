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

export const SnakeDirections = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3,
}

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
        const nextFieldType = this.getNextCellType(field, currentCell.x, currentCell.y);

        // head move
        if (nextFieldType != GameObjectType.wall &&
            nextFieldType != GameObjectType.snake) {
            // clear the cell
            field[currentCell.y][currentCell.x] = GameObjectType.empty;

            lastCellPosition = new CellPosition(currentCell.x, currentCell.y);

            if (nextFieldType == GameObjectType.apple) {
                this.addBody(field);

                let cellsToWin = field.length * field.length;
                cellsToWin -= (field.length - 2) * 4 + 4;

                if (cellsToWin == this.body.length) {
                    return gameStore.emitNotice(new GameEvent(
                        StoreEvents.RequestChangeState,
                        GameState.WinMenu)
                    );
                }

                const scoreIncrease = ScoreIncrease.getScoreIncrease(ScoreItems.Apple);
                gameStore.totalScore += scoreIncrease;
                gameStore.score += scoreIncrease;

                gameStore.emitNotice(new GameEvent(StoreEvents.changeScore));
            }

            this.changePositionByDirection(currentCell);

            // mark the field's cell with a cell of the snake
            field[currentCell.y][currentCell.x] = GameObjectType.snake;
        } else {
            // collision happend
            return gameStore.emitNotice(new GameEvent(
                StoreEvents.RequestChangeState,
                GameState.GameOverMenu)
            );
        }

        // body move
        while (bodyCounter < this.body.length) {
            currentCell = this.body[bodyCounter];

            field[currentCell.y][currentCell.x] = GameObjectType.empty;

            this.swapPositions(currentCell, lastCellPosition);

            field[currentCell.y][currentCell.x] = GameObjectType.snake;

            bodyCounter++;
        }
    }

    // add new body piece
    addBody() {
        this.body[this.body.length] = new CellPosition(0, 0);
    }

    swapPositions(cellA, cellB) {
        // x
        let tempNumber = cellA.x;
        cellA.x = cellB.x;
        cellB.x = tempNumber;

        // y
        tempNumber = cellA.y;
        cellA.y = cellB.y;
        cellB.y = tempNumber;
    }

    getNextCellType(field, x, y) {
        return this.performByDirection(
            () => field[y - 1][x],
            () => field[y][x + 1],
            () => field[y + 1][x],
            () => field[y][x - 1],
        );
    }

    changePositionByDirection(currentCell) {
        this.performByDirection(
            () => currentCell.y--,
            () => currentCell.x++,
            () => currentCell.y++,
            () => currentCell.x--,
        );
    }

    checkCollisionOnReturn(newDirection) {
        if (this.body.length == 1) return false;

        const isOpposite = this.isDirectionOpposite(newDirection);

        if (isOpposite) return isOpposite;

        const head = this.body[0];
        const neck = this.body[1];

        return this.performByDirection(
            () => neck.y == head.y - 1,
            () => neck.x == head.x + 1,
            () => neck.y == head.y + 1,
            () => neck.x == head.x - 1,
            newDirection
        );
    }

    performByDirection(topCallback, rightCallback, bottomCallback, leftCallback, direction = this.currentDirection) {
        switch (direction) {
            case SnakeDirections.bottom:
                return bottomCallback();
            case SnakeDirections.top:
                return topCallback();
            case SnakeDirections.left:
                return leftCallback();
            case SnakeDirections.right:
                return rightCallback();
        }
    }

    isDirectionOpposite(newDirection) {
        return Math.abs(
            DirectionDegrees.get(newDirection) - DirectionDegrees.get(this.currentDirection)
        ) == 180;
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

        context.fillStyle = this.snake.color;
        context.strokeStyle = '#000';
        context.lineWidth = 2;

        context.save();
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 10;
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.strokeStyle = '#030';

        for (let i = 0; i < this.snake.body.length; i++) {
            const cell = this.snake.body[i];
            context.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
            context.strokeRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        }

        this.renderSnakeEyes(context);
        context.restore();
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
        switch (this.snake.currentDirection) {
            case SnakeDirections.top:
                TransformOperations.rotateOnPosition(
                    centerX,
                    centerY,
                    0,
                    context
                );
                break;
            case SnakeDirections.right:
                TransformOperations.rotateOnPosition(
                    centerX + cellSize - eyeSize,
                    centerY + cellSize,
                    TransformOperations.toRad(270),
                    context
                );
                break;
            case SnakeDirections.bottom:
                TransformOperations.rotateOnPosition(
                    centerX + cellSize,
                    centerY + cellSize,
                    TransformOperations.toRad(180),
                    context
                );
                break;
            case SnakeDirections.left:
                TransformOperations.rotateOnPosition(
                    centerX + eyeSize,
                    centerY,
                    TransformOperations.toRad(90),
                    context
                );
                break;
        }
    }
}
