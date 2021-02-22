import { AnyListener } from "./common-types";
import { EventEmitterImpl } from "./implementation";

export type EventType<T extends AnyListener> = string & { __tag: T };

export interface IEventBus {
	/**
	 * Adds an event listener
	 * @param event the event to listen to
	 * @param listener the listener to add
	 * @returns a callback that removes the listener
	 */
	on<T extends AnyListener>(event: EventType<T>, listener: T): () => void;

	/**
	 * Adds an event listener that will only be called once
	 * @param event the event to listen to
	 * @param listener the listener to add
	 * @returns a callback that removes the listener
	 */
	once<T extends AnyListener>(event: EventType<T>, listener: T): () => void;

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
	emit<T extends AnyListener>(
		event: EventType<T>,
		...args: Parameters<T>
	): void;

	/**
	 * Emits an event and waits for the promises returned by the listeners
	 * @param event the event to emit
	 * @param args the arguments passed to the event handlers
	 */
	emitAsync<T extends AnyListener>(
		event: EventType<T>,
		...args: Parameters<T>
	): Promise<void>;
}

export const EventBus = EventEmitterImpl as new () => IEventBus;
