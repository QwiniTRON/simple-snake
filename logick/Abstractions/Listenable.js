export class Listenable {
    constructor() {
        this.listeners = new Map();
    }

    addListener(listener, type) {
        let listenersSet = this.listeners.get(type);
        if (!listenersSet) {
            listenersSet = new Set();
            this.listeners.set(type, listenersSet);
        }
        listenersSet.add(listener);
    };

    removeListener(listener, type) {
        let listenersSet = this.listeners.get(type);
        if (!listenersSet) {
            listenersSet.delete(listener);
        }
    };

    emitNotice(event) {
        const listenersSet = this.listeners.get(event.type);
        if (!listenersSet) return;

        for (let listener of listenersSet) {
            listener.call(this, this, event);
        }
    }
}