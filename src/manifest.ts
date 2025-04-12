import { ManifestFactoy } from '@shenghuabi/sdk/server';
import { NetworkSearchRunner } from './workflow/node/network-search/server';
import * as vscode from 'vscode';
import { cosmiconfig } from 'cosmiconfig';
// 不推荐变更此导出,未来可能会在其他地方使用
export const manifestFactory = (options: { browserDir: string }): ManifestFactoy => {
  const explorer = cosmiconfig(' ');
  return (input) => {
    return {
      workflow: {
        node: [
          {
            client: './workflow/node/network-search/client/index.js',
            runner: NetworkSearchRunner(input, explorer, options.browserDir),
            config: {
              type: 'crawl',
              label: `网络搜索`,
              // icon: 'manage_search',
              icon: {
                fontIcon: 'search-fuzzy',
                fontSet: 'codicon',
              },
              color: 'accent',
              help: [`- puppeteer访问网络供对话使用`].join('\n'),
              outputs: [[{ label: '转文本', value: 'toString' }]],
            },
          },
        ],
        context: {
          getFileContent: async () => {
            return vscode.window
              .showOpenDialog({ canSelectFolders: false, canSelectMany: false, filters: { ['配置']: ['json', 'yml', 'js', 'mjs', 'cjs'] } })
              .then((result) => {
                if (result) {
                  return result[0].fsPath;
                }
              });
          },
          // todo sdk类型修复
          getRuleInput: (async (filePath: string) => {
            if (!filePath) {
              return [];
            }

            return explorer
              .load(filePath)
              .then((item) => {
                return item;
              })
              .then((item) => item?.config)
              .then((item) => item.inputs);
          }) as any,
        },
      },
    };
  };
};
