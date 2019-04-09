import { EventBus, EventType, IEventBus } from "./event-bus";
import { createPromise, testPromiseResolved, testPromiseResolving } from "./test/util";

const TestEvent = "test" as EventType<(a: string, b: string) => Promise<void> | void>;

let emitter: IEventBus;
let listener: jest.Mock<Promise<void> | void, [string, string]>;

beforeAll(() => {
    emitter = new EventBus();
    listener = jest.fn();
});

beforeEach(() => {
    listener.mockReset();
});

test("unused events should return an empty array", () => {
    expect(emitter.getListeners(TestEvent)).toEqual([]);
});

test("adding listeners", () => {
    emitter.on(TestEvent, listener);
    expect(emitter.getListeners(TestEvent)).toEqual([listener]);
});

test("emitting events", () => {
    emitter.emit(TestEvent, "a", "b");
    expect(listener).toBeCalledWith("a", "b");
});

test("awaiting void listeners", async () => {
    await emitter.emitAsync(TestEvent, "a", "b");
    expect(listener).toBeCalledWith("a", "b");
});

test("awaiting listeners returning a promise", async () => {
    const [promise, resolve] = await createPromise<void>();
    listener.mockReturnValueOnce(promise);

    const emitPromise = emitter.emitAsync(TestEvent, "a", "b");
    expect(listener).toBeCalledWith("a", "b");

    await testPromiseResolving(emitPromise, resolve);
});

test("removing listeners", () => {
    emitter.off(TestEvent, listener);
    expect(emitter.getListeners(TestEvent)).toEqual([]);
});

test("awaiting without listeners", async () => {
    const promise = emitter.emitAsync(TestEvent, "a", "b");
    expect(promise).toBeInstanceOf(Promise);
    await testPromiseResolved(promise);
});

test("listening once", () => {
    emitter.once(TestEvent, listener);

    emitter.emit(TestEvent, "a", "b");
    expect(listener).toBeCalledWith("a", "b");

    listener.mockReset();
    emitter.emit(TestEvent, "a", "b");
    expect(listener).not.toBeCalled();
});
