import { Data } from "framer";

class DataStore {
  protected store: { [propName: string]: any };

  constructor() {
    this.store = Data({});
  }

  alternativeKey(id: string): string {
    return id.substr(id.indexOf("_") + 1, id.length - 1);
  }

  get(id: string): any {
    return this.store[id] || this.store[this.alternativeKey(id)];
  }

  set(id: string, data: any): void {
    // IDs are different when installed from store and locally
    const key = id.match("@") ? id.split("@")[0] : id.split("./")[0];
    this.store[key] = data;
  }

  get keys(): Array<string> {
    return Object.keys(this.store);
  }

  remove(id: string): void {
    delete this.store[id];
    delete this.store[this.alternativeKey(id)];
  }
}

export const Store = new DataStore();
