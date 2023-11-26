import Koa from 'koa';
import Router from 'koa-router';
import {WhistleStorage} from './storage';
interface WhistleRulesServerConfig {

}

type WhistleRulesServerCallback = (params: {
  storage: WhistleStorage,
  body?: any;
  query?: any;
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>
}) => any
export class WhistleRulesServer {
  server: Whistle.PluginServer;
  options: Whistle.PluginOptions;
  conf?: WhistleRulesServerConfig;
  router!: Router;
  storage: WhistleStorage;
  app: Koa = new Koa();
  rules: string[] = [];
  values: Record<string, string> = {}
  constructor(server: Whistle.PluginServer, options: Whistle.PluginOptions) {
    this.server = server;
    this.options = options;
    this.storage = new WhistleStorage(options.storage)
    this._initial();
  }

  _initial() {
    this.server.on('request', this.app.callback());
  }

  match(pattern: string | WhistleRulesServerCallback, callback) {
    
  }

  rule(pattern: string, value: string) {
    this.rules.push(`${pattern} ${value}`);
    return this
  }

  value(key: string, value: string) {
    this.values[key] = value;
    return this;
  }
}