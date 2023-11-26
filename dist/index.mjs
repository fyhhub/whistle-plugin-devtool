// src/rulesServer.ts
import Koa from "koa";

// src/storage.ts
import { get, set } from "lodash";
var WhistleStorage = class {
  constructor(storage) {
    this.storage = storage;
  }
  get(key, path2) {
    let result = this.storage.getProperty(key);
    try {
      result = JSON.parse(result);
      if (path2) {
        result = get(result, path2);
      }
    } catch {
    }
    return result;
  }
  set(key, val, path2) {
    val = typeof val === "object" ? JSON.stringify(val) : typeof val === "string" ? val : String(val);
    if (!path2) {
      this.storage.setProperty(key, val);
    } else {
      const result = this.get(key);
      if (result && typeof result === "object") {
        set(result, path2, val);
        this.storage.setProperty(key, JSON.stringify(result));
      } else {
        console.error(`path: ${path2}  \u5FC5\u987B\u5728\u5BF9\u8C61\u6570\u636E\u4E2D\u4F7F\u7528`);
      }
    }
  }
};

// src/rulesServer.ts
var WhistleRulesServer = class {
  constructor(server, options) {
    this.app = new Koa();
    this.rules = [];
    this.values = {};
    this.server = server;
    this.options = options;
    this.storage = new WhistleStorage(options.storage);
    this._initial();
  }
  _initial() {
    this.server.on("request", this.app.callback());
  }
  match(pattern, callback) {
  }
  rule(pattern, value) {
    this.rules.push(`${pattern} ${value}`);
    return this;
  }
  value(key, value) {
    this.values[key] = value;
    return this;
  }
};

// src/uiServer.ts
import Koa2 from "koa";
import bodyParser from "koa-bodyparser";
import onerror from "koa-onerror";
import serve from "koa-static";
import path from "path";
import Router from "koa-router";
import fs from "fs";
var WhistleUiServer = class {
  constructor(server, options) {
    this.server = server;
    this.options = options;
    this.storage = new WhistleStorage(options.storage);
    this._initial();
  }
  _initial() {
    const app = new Koa2();
    this.app = app;
    app.proxy = true;
    app.silent = true;
    onerror(app);
    const router = new Router();
    this.router = router;
    app.use(
      bodyParser({
        jsonLimit: "20mb",
        formLimit: "20mb",
        textLimit: "20mb"
      })
    );
    app.use(router.routes());
    app.use(router.allowedMethods());
    this.server.on("request", app.callback());
    return this;
  }
  config(conf) {
    var _a, _b, _c, _d, _e;
    this.conf = conf;
    if ((_a = this.conf) == null ? void 0 : _a.publicPath) {
      const MAX_AGE = 1e3 * 60 * 5;
      const defaultPublic = path.resolve(process.cwd(), "./public");
      const publicPath = typeof ((_b = this.conf) == null ? void 0 : _b.publicPath) === "string" ? [(_c = this.conf) == null ? void 0 : _c.publicPath] : Array.isArray((_d = this.conf) == null ? void 0 : _d.publicPath) ? (_e = this.conf) == null ? void 0 : _e.publicPath : fs.existsSync(defaultPublic) ? [defaultPublic] : void 0;
      if (publicPath) {
        publicPath.map((e) => this.app.use(serve(e, { maxage: MAX_AGE })));
      }
    }
    return this;
  }
  post(url, callback) {
    this.router.post(url, (ctx, next) => {
      var _a;
      const body = (_a = ctx.request) == null ? void 0 : _a.body;
      const data = callback({
        storage: this.storage,
        body,
        ctx
      }, next);
      if (data) {
        ctx.body = data;
      }
    });
    return this;
  }
  get(url, callback) {
    this.router.get(url, (ctx, next) => {
      const data = callback({
        storage: this.storage,
        query: ctx.query,
        ctx
      }, next);
      if (data) {
        ctx.body = data;
      }
    });
    return this;
  }
};
export {
  WhistleRulesServer,
  WhistleUiServer
};
