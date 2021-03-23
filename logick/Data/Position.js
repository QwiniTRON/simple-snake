export class CellPosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static swapPositions(cellA, cellB) {
        // x
        let tempNumber = cellA.x;
        cellA.x = cellB.x;
        cellB.x = tempNumber;

        // y
        tempNumber = cellA.y;
        cellA.y = cellB.y;
        cellB.y = tempNumber;
    }

    swapPositions(cellB) {
        // x
        let tempNumber = this.x;
        this.x = cellB.x;
        cellB.x = tempNumber;

        // y
        tempNumber = this.y;
        this.y = cellB.y;
        cellB.y = tempNumber;
    }
}