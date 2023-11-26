import { get, set } from 'lodash';

export class WhistleStorage {
  constructor(private storage: any) {}

  get(key: string, path?: string | string[]) {
    let result = this.storage.getProperty(key);
    try {
      result = JSON.parse(result);

      if (path) {
        result = get(result, path);
      }
    } catch {}
    return result;
  }

  set(key: string, val: any, path?: string | string[]) {
    val =
      typeof val === 'object'
        ? JSON.stringify(val)
        : typeof val === 'string'
        ? val
        : String(val);

    if (!path) {
      this.storage.setProperty(key, val)
    } else {
      const result = this.get(key);
      if (result && typeof result === 'object') {
        set(result, path, val);
        this.storage.setProperty(key, JSON.stringify(result))
      } else {
        console.error(`path: ${path}  必须在对象数据中使用`);
      }
    }
  }
}
