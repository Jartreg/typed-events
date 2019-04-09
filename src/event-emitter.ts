import { AnyListener } from "./common-types";
import { EventEmitterImpl } from "./implementation";

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

export const EventEmitter = EventEmitterImpl as
    new <TEvents extends {[event: string]: AnyListener}>() => IEventEmitter<TEvents>;
