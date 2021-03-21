import { Controller } from '../Abstractions/Abstractions.js';
import { GameState } from '../State/GameStore.js';
import { GameEvent } from '../Abstractions/GameEvent.js';
import { StoreEvents } from '../Data/Enums.js';
import { KeyActionType } from '../State/KeyinputConfig.js';

class Menus {
    constructor() {
        this.isMenuOpened = false;
    }

    openCurrentMenu(gameState, gameStore) {
        switch (gameState) {
            case GameState.StartMenu:
                this.openStartMenu(this.startHandler.bind(this, gameStore));
                break;
            case GameState.GameOverMenu:
                this.openGameOverMenu(this.restartHandler.bind(this, gameStore));
                break;
            case GameState.PauseMenu:
                this.openPauseMenu(this.pauseMenuHandle.bind(this, gameStore));
                break;
        }

        this.isMenuOpened = true;
    }

    startHandler(gameStore) {
        gameStore.emitNotice(
            new GameEvent(StoreEvents.RequestChangeState, GameState.Game)
        );
    }

    openStartMenu(startHandler) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="menu" id="menu">
                <div class="menu__content">
                    <div class="menu__title">Игра змейка</div>
                    <div class="menu__text">Просто игра змейка.</div>
                    <div class="buttons-group menu__buttons buttons-group--center">
                        <div class="button" id="start">Начать</div>
                    </div>
                </div>
            </div>
        `);

        document.getElementById('start').addEventListener('click', startHandler);
    }

    restartHandler() {
        window.location.reload();
    }

    openGameOverMenu(restartHandler) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="menu" id="menu">
                <div class="menu__content">
                    <div class="menu__title">Вы проиграли</div>
                    <div class="menu__text --center-text">Попробуйте заново.</div>
                    <div class="buttons-group menu__buttons buttons-group--center">
                        <div class="button" id="start">Начать</div>
                    </div>
                </div>
            </div>
        `);

        document.getElementById('start').addEventListener('click', restartHandler);
    }
    pauseMenuHandle(gameStore) {
        gameStore.emitNotice(new GameEvent(StoreEvents.RequestChangeState, GameState.Game));
    }

    openPauseMenu(continueHandler) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="menu" id="menu">
                <div class="menu__content">
                    <div class="menu__title">Пауза</div>
                    <div class="buttons-group menu__buttons buttons-group--center">
                        <div class="button" id="continue">Продолжить</div>
                    </div>
                </div>
            </div>
        `);

        document.getElementById('continue').addEventListener('click', continueHandler);
    }

    restartHandler() {
        window.location.reload();
    }

    openWinMenu(restartHandler) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="menu" id="menu">
                <div class="menu__content">
                    <div class="menu__title">Вы Выиграли</div>
                    <div class="menu__text --center-text">Поздравляем</div>
                    <div class="buttons-group menu__buttons buttons-group--center">
                        <div class="button" id="start">Начать заново</div>
                    </div>
                </div>
            </div>
        `);

        document.getElementById('start').addEventListener('click', restartHandler);
    }

    clearMenu() {
        this.isMenuOpened = false;
        const menu = document.getElementById('menu');

        if (menu) {
            menu.remove();
        }
    }
}

export class MenusController extends Controller {
    constructor(gameStore, keyboardActionProvider) {
        super();

        this.menus = new Menus();

        gameStore.addListener(() => {
            this.menus.clearMenu();
        }, StoreEvents.ChangeGameState);

        keyboardActionProvider.addListener(() => {
            let event;
            if (gameStore.gameState == GameState.Game) {
                event = new GameEvent(StoreEvents.RequestChangeState, GameState.PauseMenu);
            }
            if (gameStore.gameState == GameState.PauseMenu) {
                event = new GameEvent(StoreEvents.RequestChangeState, GameState.Game);
            }

            if (!event) return;

            gameStore.emitNotice(event);
        }, KeyActionType.ToggleMenu);
    }

    work(timeMark, context, field, gameStore) {
        if (gameStore.gameState == GameState.Game ||
            gameStore.gameState == GameState.Wait) return this.menus.clearMenu();
        if (this.menus.isMenuOpened) return;

        this.menus.openCurrentMenu(gameStore.gameState, gameStore);
    }
}