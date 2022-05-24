export class NpmCliConfigStub {

  constructor() {
    this.list = [{}, {}];
  }

  load(): Promise<any> {
    return Promise.resolve();
  }

  list: any[];

}