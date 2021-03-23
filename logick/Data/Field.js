import { Direction } from "./Direction.js";
import { GameObjectType } from "./Enums.js";
import { CellPosition } from "./Position.js";

export class Field {
    static clearFieldCell(field, cell) {
        field[cell.y][cell.x] = GameObjectType.empty;
    }

    static markFieldCellSnake(field, cell) {
        field[cell.y][cell.x] = GameObjectType.snake;
    }

    static getNextCellType(field, cell, direction) {
        return Direction.performByDirection(
            () => field[cell.y - 1][cell.x],
            () => field[cell.y][cell.x + 1],
            () => field[cell.y + 1][cell.x],
            () => field[cell.y][cell.x - 1],
            direction
        );
    }

    static getClearPlaces(field) {
        const result = [];

        for (let j = 0; j < field.length; j++) {
            for (let i = 0; i < field[j].length; i++) {
                if (field[j][i] == GameObjectType.empty) {
                    result.push(new CellPosition(i, j));
                }
            }
        }

        return result;
    }
}