"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  WhistleRulesServer: () => WhistleRulesServer,
  WhistleUiServer: () => WhistleUiServer
});
module.exports = __toCommonJS(src_exports);

// src/rulesServer.ts
var import_koa = __toESM(require("koa"));

// src/storage.ts
var import_lodash = require("lodash");
var WhistleStorage = class {
  constructor(storage) {
    this.storage = storage;
  }
  get(key, path2) {
    let result = this.storage.getProperty(key);
    try {
      result = JSON.parse(result);
      if (path2) {
        result = (0, import_lodash.get)(result, path2);
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
        (0, import_lodash.set)(result, path2, val);
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
    this.app = new import_koa.default();
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
var import_koa2 = __toESM(require("koa"));
var import_koa_bodyparser = __toESM(require("koa-bodyparser"));
var import_koa_onerror = __toESM(require("koa-onerror"));
var import_koa_static = __toESM(require("koa-static"));
var import_path = __toESM(require("path"));
var import_koa_router = __toESM(require("koa-router"));
var import_fs = __toESM(require("fs"));
var WhistleUiServer = class {
  constructor(server, options) {
    this.server = server;
    this.options = options;
    this.storage = new WhistleStorage(options.storage);
    this._initial();
  }
  _initial() {
    const app = new import_koa2.default();
    this.app = app;
    app.proxy = true;
    app.silent = true;
    (0, import_koa_onerror.default)(app);
    const router = new import_koa_router.default();
    this.router = router;
    app.use(
      (0, import_koa_bodyparser.default)({
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
      const defaultPublic = import_path.default.resolve(process.cwd(), "./public");
      const publicPath = typeof ((_b = this.conf) == null ? void 0 : _b.publicPath) === "string" ? [(_c = this.conf) == null ? void 0 : _c.publicPath] : Array.isArray((_d = this.conf) == null ? void 0 : _d.publicPath) ? (_e = this.conf) == null ? void 0 : _e.publicPath : import_fs.default.existsSync(defaultPublic) ? [defaultPublic] : void 0;
      if (publicPath) {
        publicPath.map((e) => this.app.use((0, import_koa_static.default)(e, { maxage: MAX_AGE })));
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WhistleRulesServer,
  WhistleUiServer
});
