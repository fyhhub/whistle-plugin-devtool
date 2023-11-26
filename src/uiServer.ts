import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import onerror from 'koa-onerror';
import serve from 'koa-static';
import path from 'path';
import Router from 'koa-router';
import fs from 'fs';
import {WhistleStorage} from './storage';
interface WhistleUiServerConfig {
  /**
   * whistle插件前端ui 的 静态资源目录, 要求绝对路径
   */
  publicPath: string | string[];
}
type WhistleUiServerCallback = (params: {
  storage: WhistleStorage,
  body?: any;
  query?: any;
  ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>
}, next: any) => any

export class WhistleUiServer {
  server: Whistle.PluginServer;
  options: Whistle.PluginOptions;
  conf?: WhistleUiServerConfig;
  router!: Router;
  storage: WhistleStorage;
  app!: Koa;
  constructor(server: Whistle.PluginServer, options: Whistle.PluginOptions) {
    this.server = server;
    this.options = options;
    this.storage = new WhistleStorage(options.storage)
    this._initial()
  }


  _initial() {
    const app = new Koa();
    this.app = app;
    app.proxy = true;
    app.silent = true;
    onerror(app);
    const router = new Router();
    this.router = router;
    // setupRouter(router);
    app.use(
      bodyParser({
        jsonLimit: '20mb',
        formLimit: '20mb',
        textLimit: '20mb'
      })
    );
    app.use(router.routes());
    app.use(router.allowedMethods());


    this.server.on('request', app.callback());


    return this;
  }

  config(conf: WhistleUiServerConfig) {
    this.conf = conf;
    if (this.conf?.publicPath) {
      const MAX_AGE = 1000 * 60 * 5;
      const defaultPublic = path.resolve(process.cwd(), './public');
      const publicPath =
        typeof this.conf?.publicPath === 'string'
          ? [this.conf?.publicPath]
            : Array.isArray(this.conf?.publicPath)
              ? this.conf?.publicPath
                : fs.existsSync(defaultPublic)
                  ? [defaultPublic]
                    : undefined;
      if (publicPath) {
        publicPath.map(e => this.app.use(serve(e, { maxage: MAX_AGE })));
      }
    }
    return this;
  }

  post(url: string, callback: WhistleUiServerCallback) {
    this.router.post(url, (ctx, next) => {
      const body = ctx.request?.body;
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

  get(url: string, callback: WhistleUiServerCallback) {
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
}
