import { EventEmitter, IEventEmitter } from "./event-emitter";
import { createPromise, testPromiseResolved, testPromiseResolving } from "./test/util";

// It is necessary to use a type literal here, because we would otherwise get a compiler error
// tslint:disable-next-line: interface-over-type-literal
type TestEvents = {
    "test": (a: string, b: string) => Promise<void> | void;
};

let emitter: IEventEmitter<TestEvents>;
let listener: jest.Mock<Promise<void> | void, [string, string]>;

beforeAll(() => {
    emitter = new EventEmitter<TestEvents>();
    listener = jest.fn();
});

beforeEach(() => {
    listener.mockReset();
});

test("unused events should return an empty array", () => {
    expect(emitter.getListeners("test")).toEqual([]);
});

test("adding listeners", () => {
    emitter.on("test", listener);
    expect(emitter.getListeners("test")).toEqual([listener]);
});

test("emitting events", () => {
    emitter.emit("test", "a", "b");
    expect(listener).toBeCalledWith("a", "b");
});

test("awaiting void listeners", async () => {
    await emitter.emitAsync("test", "a", "b");
    expect(listener).toBeCalledWith("a", "b");
});

test("awaiting listeners returning a promise", async () => {
    const [promise, resolve] = await createPromise<void>();
    listener.mockReturnValueOnce(promise);

    const emitPromise = emitter.emitAsync("test", "a", "b");
    expect(listener).toBeCalledWith("a", "b");

    await testPromiseResolving(emitPromise, resolve);
});

test("removing listeners", () => {
    emitter.off("test", listener);
    expect(emitter.getListeners("test")).toEqual([]);
});

test("awaiting without listeners", async () => {
    const promise = emitter.emitAsync("test", "a", "b");
    expect(promise).toBeInstanceOf(Promise);
    await testPromiseResolved(promise);
});

test("listening once", () => {
    emitter.once("test", listener);

    emitter.emit("test", "a", "b");
    expect(listener).toBeCalledWith("a", "b");

    listener.mockReset();
    emitter.emit("test", "a", "b");
    expect(listener).not.toBeCalled();
});
