import { throwNotStringOrEmpty } from '@esm-test/guards';
import { commands } from 'vscode';

export class ContextState<T> {

  constructor(private readonly key: string) {
    throwNotStringOrEmpty("key", key);
    this.key = this.key;
  }

  private _value!: T;

  get value(): T {
    return this._value;
  }

  async change(newValue: T): Promise<T> {
    this._value = newValue;
    return await commands.executeCommand(
      'setContext',
      this.key,
      newValue
    );
  }

}