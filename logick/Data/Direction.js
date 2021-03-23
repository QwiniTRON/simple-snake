export const Directions = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3
}

export const DirectionDegress = new Map([
    [Directions.top, 90],
    [Directions.right, 0],
    [Directions.bottom, 270],
    [Directions.left, 180],
]);

export class Direction {
    static performByDirection(topCallback,
        rightCallback,
        bottomCallback,
        leftCallback,
        direction
    ) {
        switch (direction) {
            case Directions.bottom:
                return bottomCallback();
            case Directions.top:
                return topCallback();
            case Directions.left:
                return leftCallback();
            case Directions.right:
                return rightCallback();
        }
    }

    static isDirectionOpposite(firstDirection, secondDirection) {
        return Math.abs(
            DirectionDegress.get(firstDirection) - DirectionDegress.get(secondDirection)
        ) == 180;
    }
}