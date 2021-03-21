export const ScoreItems = {
    Apple: 0,
}
const ScoreValues = {
    [ScoreItems.Apple]: 350,
}

export class ScoreIncrease {
    static getScoreIncrease(recivedItem) {
        return ScoreValues[recivedItem];
    }
}

export class ScoreCalcuate {
    constructor() { }

    static calculateUserScore(userScore, userLevel) {
        let resultLevel = userLevel + 1;
        let costToLevel = ScoreCalcuate.calculateLevelCost(resultLevel);

        while (costToLevel < userScore) {
            userLevel = resultLevel;
            userScore = userScore - costToLevel;
            resultLevel++;
            costToLevel = ScoreCalcuate.calculateLevelCost(resultLevel);
        }

        return [userScore, userLevel];
    }

    static calculateLevelCost(level) {
        return level * 1000 * 3;
    }
}