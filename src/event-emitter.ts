import { AnyListener } from "./common-types";

export interface IEventEmitter<TEvents extends {[event: string]: AnyListener}> {
    /**
     * Adds an event listener
     * @param event the event to listen to
     * @param listener the listener to add
     */
    on<E extends keyof TEvents>(event: E, listener: TEvents[E]): void;

    /**
     * Adds an event listener that will only be called once
     * @param event the event to listen to
     * @param listener the listener to add
     */
    once<E extends keyof TEvents>(event: E, listener: TEvents[E]): void;

    /**
     * Removes an event listener
     * @param event the event
     * @param listener the listener to remove
     */
    off<E extends keyof TEvents>(event: E, listener: TEvents[E]): void;

    /**
     * Gets the listeners for a specific event
     * @param event the event
     */
    getListeners<E extends keyof TEvents>(event: E): Array<TEvents[E]>;

    /**
     * Emits an event
     * @param event the event to emit
     * @param args the arguments passed to the event handlers
     */
    emit<E extends keyof TEvents>(event: E, ...args: Parameters<TEvents[E]>): void;

    /**
     * Emits an event and waits for the promises returned by the listeners
     * @param event the event to emit
     * @param args the arguments passed to the event handlers
     */
    emitAsync<E extends keyof TEvents>(event: E, ...args: Parameters<TEvents[E]>): Promise<void>;
}

export class EventEmitter<TEvents extends {[event: string]: AnyListener}> implements IEventEmitter<TEvents> {
    private readonly listeners: { [E in keyof TEvents]?: Array<TEvents[E]> } = {};

    on<E extends keyof TEvents>(event: E, listener: TEvents[E]) {
        const listeners: Array<TEvents[E]> | undefined = this.listeners[event];
        (listeners || (this.listeners[event] = [])).push(listener);
    }

    once<E extends keyof TEvents>(event: E, listener: TEvents[E]) {
        const onceListener = ((...args: Parameters<TEvents[E]>) => {
            this.off(event, onceListener);
            listener(...args);
        }) as TEvents[E];

        this.on(event, onceListener);
    }

    off<E extends keyof TEvents>(event: E, listener: TEvents[E]) {
        const listeners = this.listeners[event];
        if (listeners) {
            const i = listeners.indexOf(listener);

            if (i !== -1) {
                listeners.splice(i, 1);
            }
        }
    }

    getListeners<E extends keyof TEvents>(event: E): Array<TEvents[E]> {
        const listeners: Array<TEvents[E]> | undefined = this.listeners[event];
        return listeners || [];
    }

    emit<E extends keyof TEvents>(event: E, ...args: Parameters<TEvents[E]>) {
        const listeners: Array<TEvents[E]> | undefined = this.listeners[event];
        if (listeners) {
            listeners.forEach((listener) => listener(...args));
        }
    }

    emitAsync<E extends keyof TEvents>(event: E, ...args: Parameters<TEvents[E]>): Promise<void> {
        const listeners: Array<TEvents[E]> | undefined = this.listeners[event];
        if (listeners && listeners.length !== 0) {
            return Promise.all(listeners.map((listener) => listener(...args))) as any;
        }

        return Promise.resolve();
    }
}
