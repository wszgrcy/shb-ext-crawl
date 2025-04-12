import * as vscode from 'vscode';
import { manifestFactory } from './manifest';
import { shbPluginRegister } from '@shenghuabi/sdk';
import path from 'path';

let dispose$$: Promise<() => any> | undefined;
// 入口
export function activate(context: vscode.ExtensionContext) {
  dispose$$ = shbPluginRegister(context, manifestFactory({ browserDir: path.join(context.extensionPath, '../browser') }));
}
export function deactivate() {
  dispose$$?.then((fn) => fn());
}
