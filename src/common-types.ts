export type EventResult = Promise<void> | void;

export type AnyListener = (...args: any[]) => EventResult;
