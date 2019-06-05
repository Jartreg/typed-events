import { EventEmitterImpl } from "./implementation";
import { createPromise, testPromiseResolved, testPromiseResolving } from "./test/util";

let emitter: EventEmitterImpl;
let listener: jest.Mock<Promise<void> | void, [string, string]>;

beforeAll(() => {
    emitter = new EventEmitterImpl();
    listener = jest.fn();
});

beforeEach(() => {
    listener.mockReset();
});

test("unused events should return an empty array", () => {
    expect(emitter.getListeners("test-event")).toEqual([]);
});

test("emiting unused events", async () => {
    emitter.emit("test-event");
    await emitter.emitAsync("test-event");
});

test("removing listeners from unused events", () => {
    emitter.off("test-event", () => undefined);
});

test("adding listeners", () => {
    emitter.on("test-event", listener);
    expect(emitter.getListeners("test-event")).toEqual([listener]);
});

test("removing listeners that have never been added", () => {
    emitter.off("test-event", () => undefined);
});

test("emitting events", () => {
    emitter.emit("test-event", "a", "b");
    expect(listener).toBeCalledWith("a", "b");
});

test("awaiting void listeners", async () => {
    await emitter.emitAsync("test-event", "a", "b");
    expect(listener).toBeCalledWith("a", "b");
});

test("awaiting listeners returning a promise", async () => {
    const [promise, resolve] = await createPromise<void>();
    listener.mockReturnValueOnce(promise);

    const emitPromise = emitter.emitAsync("test-event", "a", "b");
    expect(listener).toBeCalledWith("a", "b");

    await testPromiseResolving(emitPromise, resolve);
});

test("removing listeners", () => {
    emitter.off("test-event", listener);
    expect(emitter.getListeners("test-event")).toEqual([]);
});

test("awaiting without listeners", async () => {
    const promise = emitter.emitAsync("test-event", "a", "b");
    expect(promise).toBeInstanceOf(Promise);
    await testPromiseResolved(promise);
});

test("listening once", () => {
    emitter.once("test-event", listener);

    emitter.emit("test-event", "a", "b");
    expect(listener).toBeCalledWith("a", "b");

    listener.mockReset();
    emitter.emit("test-event", "a", "b");
    expect(listener).not.toBeCalled();
});

test("removing listeners during execution should have no immediate effect", () => {
    emitter.on("test-event", () => {
        emitter.off("test-event", listener);
    });

    emitter.on("test-event", listener);

    emitter.emit("test-event", "a", "b");
    expect(listener).toBeCalled();

    listener.mockReset();
    emitter.emit("test-event", "a", "b");
    expect(listener).not.toBeCalled();
});

test("removing listeners during async execution should have no immediate effect", async () => {
    emitter.on("test-event", listener);

    await emitter.emitAsync("test-event", "a", "b");
    expect(listener).toBeCalled();

    listener.mockReset();
    await emitter.emitAsync("test-event", "a", "b");
    expect(listener).not.toBeCalled();
});
