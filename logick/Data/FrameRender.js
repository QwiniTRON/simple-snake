/**
 * shecks frameTime and work with time different
 */
export class FrameRender {
    constructor(initTime = 0, fps = 60) {
        this.time = initTime;
        this.fps = fps;
    }

    countFramesOnRender(time) {
        const millisecondsPerFrame = 1000 / this.fps;
        
        const result = (time - this.time) / millisecondsPerFrame;

        this.time = time;

        return result;
    }
}