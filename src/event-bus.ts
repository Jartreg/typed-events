import { AnyListener } from "./common-types";

export type EventType<T extends AnyListener> = string & { __tag: T };

export interface IEventBus {
    /**
     * Adds an event listener
     * @param event the event to listen to
     * @param listener the listener to add
     */
    on<T extends AnyListener>(event: EventType<T>, listener: T): void;

    /**
     * Adds an event listener that will only be called once
     * @param event the event to listen to
     * @param listener the listener to add
     */
    once<T extends AnyListener>(event: EventType<T>, listener: T): void;

    /**
     * Removes an event listener
     * @param event the event
     * @param listener the listener to remove
     */
    off<T extends AnyListener>(event: EventType<T>, listener: T): void;

    /**
     * Gets the listeners for a specific event
     * @param event the event
     */
    getListeners<T extends AnyListener>(event: EventType<T>): T[];

    /**
     * Emits an event
     * @param event the event to emit
     * @param args the arguments passed to the event handlers
     */
    emit<T extends AnyListener>(event: EventType<T>, ...args: Parameters<T>): void;

    /**
     * Emits an event and waits for the promises returned by the listeners
     * @param event the event to emit
     * @param args the arguments passed to the event handlers
     */
    emitAsync<T extends AnyListener>(event: EventType<T>, ...args: Parameters<T>): Promise<void>;
}

export class EventBus implements IEventBus {
    private readonly listeners: { [event: string]: AnyListener[] } = {};

    on<T extends AnyListener>(event: EventType<T>, listener: T) {
        const listeners = this.listeners[event] as T[] | undefined;
        (listeners || (this.listeners[event] = [])).push(listener);
    }

    once<T extends AnyListener>(event: EventType<T>, listener: T) {
        const onceListener = ((...args: Parameters<T>) => {
            this.off(event, onceListener);
            listener(...args);
        }) as T;

        this.on(event, onceListener);
    }

    off<T extends AnyListener>(event: EventType<T>, listener: T) {
        const listeners = this.listeners[event];
        if (listeners) {
            const i = listeners.indexOf(listener);

            if (i !== -1) {
                listeners.splice(i, 1);
            }
        }
    }

    getListeners<T extends AnyListener>(event: EventType<T>): T[] {
        const listeners = this.listeners[event] as T[] | undefined;
        return listeners || [];
    }

    emit<T extends AnyListener>(event: EventType<T>, ...args: Parameters<T>) {
        const listeners = this.listeners[event] as T[] | undefined;
        if (listeners) {
            listeners.forEach((listener) => listener(...args));
        }
    }

    emitAsync<T extends AnyListener>(event: EventType<T>, ...args: Parameters<T>): Promise<void> {
        const listeners = this.listeners[event] as T[] | undefined;
        if (listeners && listeners.length !== 0) {
            return Promise.all(listeners.map((listener) => listener(...args))) as any;
        }

        return Promise.resolve();
    }
}
