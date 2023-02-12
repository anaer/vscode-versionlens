import { commands } from 'vscode';

export class ContextState<T> {

  constructor(key: string, defaultValue: T) {
    this.key = key;
    this.change(defaultValue);
  }

  private key: string;

  private _value!: T;

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this.change(newValue);
  }

  change(newValue: T): Thenable<T> {
    this._value = newValue;
    return commands.executeCommand(
      'setContext',
      this.key,
      newValue
    );
  }

}