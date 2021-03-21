export class TransformOperations {
    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {number} y 
     * @param {number} x 
     * @param {number} angle 
     */
    static rotateOnPosition(x, y, angle, context) {
        context.translate(x, y);
        context.rotate(angle);
    }

    static toRad(deg) {
        return Math.PI / 180 * deg;
    }
}