import { IDispose } from "domain/generics";

export interface IServiceProvider extends IDispose {

  name: string;

  getService: <T>(name: string) => T;

}