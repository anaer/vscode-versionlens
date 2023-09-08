type AsyncEvent = (...args: any[]) => Promise<void>;

async function fire(...args: any[]): Promise<void> {
  for (const [listener, thisArg] of this.listeners) {
    await listener.call(thisArg, ...args);
  }
}

export class AsyncEmitter<T extends AsyncEvent> {

  private listeners: Map<T, any> = new Map();

  registerListener(listener: T, thisArg?: any) {
    if (this.listeners.has(listener)) {
      throw new Error(`'${listener.name}' listener already registered`)
    }

    this.listeners.set(listener, thisArg);
  }

  unregisterListener(listener: T) {
    this.listeners.delete(listener);
  }

  // @ts-ignore tricks typescript to show event parameters instead of a spread
  fire: T = fire;

}