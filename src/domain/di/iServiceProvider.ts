import { IDisposable } from "domain/generics";

export interface IServiceProvider extends IDisposable {

  name: string;

  getService: <T>(name: string) => T;

}