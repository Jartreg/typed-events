export function createPromise<T>(): Promise<[Promise<T>, (result: T) => void, (error?: Error) => void]> {
    return new Promise((resolve) => {
        const promise = new Promise<T>((resolveFn, rejectFn) => {
            resolve([promise, (result: T) => resolveFn(result), rejectFn]);
        });
    });
}

export function immediate(): Promise<void> {
    return Promise.resolve();
}

export async function testPromiseResolved(promise: Promise<any>) {
    const callback = jest.fn();
    promise.then(callback);

    await immediate();
    expect(callback).toBeCalled();
}

export async function testPromiseResolving(promise: Promise<any>, resolve: (result: void) => any): Promise<void> {
    const callback = jest.fn();
    promise.then(callback);

    await immediate();
    expect(callback).not.toBeCalled();

    resolve();

    await immediate();
    expect(callback).toBeCalled();
}
