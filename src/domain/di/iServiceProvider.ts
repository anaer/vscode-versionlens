export interface IServiceProvider {

  name: string;

  getService: <T>(name: string) => T;

}