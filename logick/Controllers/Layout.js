import { Controller, Renderer } from "../Abstractions/Abstractions.js";

class LayoutRenderer extends Renderer {
    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;
    }

    render(context) {
        // clear
        context.fillStyle = '#fff';
        context.fillRect(0, 0, this.width, this.height);
        this.tick = 0;

        // fill background color
        context.fillStyle = '#8f8';
        context.fillRect(0, 0, this.width, this.height);
    }
}

export class LayoutController extends Controller {
    constructor(width, height) {
        super();

        this.renderer = new LayoutRenderer(width, height);
    }

    work(timeMark, context, field, gameStore) {
        this.renderer.render(context);
    }
}