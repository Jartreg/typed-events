# Typed Events

Type-safe events for TypeScript, either predefined or based on tag types

## Features
* Type safety at compile time
* Suggestions in editors supporting TypeScript
* Asynchronous events

## Usage

### EventEmitter
`EventEmitter` allows you to use events defined in a type definition.

Define the events:
```typescript
type EventTypes = {
    "greet": (who: string) => Promise<void> | void,
    "other-event": (something: number) => Promise<void> | void
};
```

Instantiate or extend `EventEmitter` and specify the defined events:
```typescript
const emitter = new EventEmitter<EventTypes>();

// OR

class SomeClass extends EventEmitter<EventTypes> {
    // ...
}

const someObject = new SomeClass();
```

Use the emitter and enjoy getting suggestions from your editor:
```typescript
emitter.on("greet", (who) => {
    console.log("Hello " + who + "!");
});

emitter.emit("greet", "World");
```

### EventBus
`EventBus` uses tag types to put type information into strings. It allows you to use any event on any `EventBus`, still providing type information for parameters.
However, since the events are distinguished by strings at runtime, their names should be unique.

Define event types:
```typescript
const GreetEvent = "greet" as EventType<(who: string) => Promise<void> | void>;
```

Instantiate or extend `EventBus`:
```typescript
const bus = new EventBus();

// OR

class SomeClass extends EventBus {
    // ...
}

const someObject = new SomeClass();
```

Use it:
```typescript
bus.on(GreetEvent, (who) => {
    console.log("Hello " + who + "!");
});

bus.emit(GreetEvent, "World");
```

#### Avoid name collisions
Since events are distinguished by the string assigned to their constant, different event types identified by the same string will still compile but might lead to unexpected behaviour at runtime:

```typescript
// Two events with the same name, but different types:
const FunctionEvent = "some-event" as EventType<(cb: () => void)) => Promise<void> | void>;
const StringEvent = "some-event" as EventType<(arg: string) => Promise<void> | void>;

const bus = new EventBus();

// A listener expecting a function
bus.on(NumberEvent, (cb: () => void)) => {
    // something...
    cb();
});

// Emitting the event with a string as the argument
bus.emit(StringEvent, "try calling me!");
```

Will result in:
```
TypeError: "string" is not a function
```

### Asynchronous events
To wait for asynchronous event listeners, make them return a promise and use `emitAsync` when emitting the event:

```typescript
// using async-await:
emitter.on("some-event", async () => {
    await somethingAsync();
});


// inside of an async function:

// wait for all listeners to complete
await emitter.emitAsync("some-event");
```
