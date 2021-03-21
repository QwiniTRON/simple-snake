import { Controller, Renderer } from "../Abstractions/Abstractions.js";

class ScoreRenderer extends Renderer {
    constructor(scoreTableSize, fieldSize) {
        super();

        this.scoreTableSize = scoreTableSize;
        this.fieldSize = fieldSize;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context, userLevel, userScore) {
        context.strokeStyle = 'brown';

        const tableMargin = 5;
        context.strokeRect(
            this.fieldSize + tableMargin,
            tableMargin,
            this.scoreTableSize - tableMargin * 2,
            this.fieldSize - tableMargin * 2
        );

        context.fillStyle = 'red';
        context.font = 'bold 24px Arial';
        context.textBaseline = 'top';
        context.lineWidth = 1;

        context.fillText(
            'Score',
            this.fieldSize + tableMargin * 2,
            tableMargin * 2,
            this.scoreTableSize - tableMargin * 4
        );
        context.strokeText(
            'Score',
            this.fieldSize + tableMargin * 2,
            tableMargin * 2,
            this.scoreTableSize - tableMargin * 4
        );


        context.fillText(
            'level: ',
            this.fieldSize + tableMargin * 2,
            tableMargin * 2 + 30,
            this.scoreTableSize - tableMargin * 4
        );
        context.fillText(
            'total score: ',
            this.fieldSize + tableMargin * 2,
            tableMargin * 2 + 80,
            this.scoreTableSize - tableMargin * 4
        );

        context.font = 'bold 18px Arial';
        context.fillStyle = 'green';
        context.fillText(
            `${userLevel}`,
            this.fieldSize + tableMargin * 3,
            tableMargin * 2 + 60,
            this.scoreTableSize - tableMargin * 4
        );
        context.fillText(
            `${userScore}`,
            this.fieldSize + tableMargin * 3,
            tableMargin * 2 + 110,
            this.scoreTableSize - tableMargin * 4
        );
    }
}

export class ScoreController extends Controller {
    constructor(scoreTableSize, fieldSize) {
        super();

        this.scoreRender = new ScoreRenderer(scoreTableSize, fieldSize);
    }

    work(timeMark, context, field, gameStore) {
        this.scoreRender.render(context, gameStore.level, gameStore.totalScore);
    }
}