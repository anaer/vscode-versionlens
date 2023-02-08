export type TAsyncFunction<T> = (...args: Array<any>) => Promise<T>;

export const AsyncFunction = async function () { }.constructor;