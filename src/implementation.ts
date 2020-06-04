import { AnyListener } from "./common-types";

export class EventEmitterImpl {
    private readonly listeners: { [event: string]: undefined | AnyListener[] } = {};

    on(event: string, listener: AnyListener): () => void {
        const listeners: AnyListener[] | undefined = this.listeners[event];
        (listeners || (this.listeners[event] = [])).push(listener);

        return () => this.off(event, listener);
    }

    once(event: string, listener: AnyListener): () => void {
        const onceListener = ((...args: any[]) => {
            this.off(event, onceListener);
            return listener(...args);
        });

        return this.on(event, onceListener);
    }

    off(event: string, listener: AnyListener): void {
        const listeners = this.listeners[event];
        if (listeners) {
            const i = listeners.indexOf(listener);

            if (i !== -1) {
                listeners.splice(i, 1);
            }
        }
    }

    getListeners(event: string): AnyListener[] {
        const listeners: AnyListener[] | undefined = this.listeners[event];
        return listeners ? [...listeners] : [];
    }

    emit(event: string, ...args: any[]): void {
        const listeners: AnyListener[] | undefined = this.getListeners(event);
        if (listeners.length !== 0) {
            listeners.forEach((listener) => listener(...args));
        }
    }

    emitAsync(event: string, ...args: any[]): Promise<void> {
        const listeners: AnyListener[] | undefined = this.getListeners(event);
        if (listeners.length !== 0) {
            return Promise.all(listeners.map((listener) => listener(...args))) as any;
        }

        return Promise.resolve();
    }
}
