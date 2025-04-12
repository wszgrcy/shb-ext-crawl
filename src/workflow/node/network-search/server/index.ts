import { ManifestInput } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from '../common/define';
import { init } from '@cyia/crawl';
import { PublicExplorer } from 'cosmiconfig';
import * as vscode from 'vscode';
import { CHANNEL } from '../../../../channel';
const toMarkdown = (content: string) => `你是一个信息提取专家
用户的搜索主题为: "${content}"
请根据用户的搜索主题提取输入内容,提取规则如下
1. 只提取输入内容中符合搜索主题的内容
2. 排除所有与搜索主题无关的内容
3. 返回内容应该尽可能简单有效
4. 如果该页面没有可以提取的内容,请返回'无可用内容'

提取完成后,直接返回`;
const BrowserConfig = vscode.workspace.getConfiguration('shb-crawl');

export function NetworkSearchRunner(input: ManifestInput, explorer: PublicExplorer, dir: string) {
  return class extends input.provider.workflow.NodeRunnerBase {
    override async run() {
      const instance = this.injector.get(input.provider.root.ChatService);
      const content = this.inputValueObject$$()['$content'];
      const data = this.getParsedNode(NODE_DEFINE(input.componentDefine));

      CHANNEL.info(`节点配置: ${JSON.stringify(data)}`);
      CHANNEL.info(`准备初始化浏览器`);
      CHANNEL.info(`浏览器文件夹: ${dir}, 无头运行: ${BrowserConfig.get('browser.headless')}`);
      const browser = await init({ cacheDir: dir, headless: BrowserConfig.get('browser.headless') });
      CHANNEL.info(`浏览器初始化完成`);
      let inputObject = this.inputValueObject$$();
      CHANNEL.info(`输入变量: ${JSON.stringify(inputObject)}`);

      this.abortSignal?.addEventListener(
        'abort',
        () => {
          browser.browser.close();
        },
        { once: true }
      );
      browser.registerCustom('extractMessage', async (input, page) => {
        let title = await page.page.title();
        const reference = {
          type: '链接',
          description: title,
          reference: {
            type: 'url' as const,
            title: title,
            url: page.page.url(),
          },
        };
        const streamData = this.emitter.createLLMData({
          node: this.node,
          value: '',
          extra: {
            historyList: [],
            delta: '',
            content: '',
            references: [reference],
          },
        });
        const res = (await instance.chat()).stream(
          {
            messages: [
              {
                role: 'system',
                content: [{ text: toMarkdown(content), type: 'text' }],
              },
              { role: 'user', content: [{ text: page.getVariable(input.input), type: 'text' }] },
            ],
          },
          { signal: this.abortSignal }
        );
        for await (const item of res) {
          const value = item.content;
          streamData.value = value;
          streamData.extra = { ...streamData.extra, ...item, content: value };

          this.emitter.send(streamData);
        }
        return { title: title, content: streamData.value, reference };
      });
      const file = await explorer.load(data.data.value).then((item) => item?.config);
      if (file.global) {
        browser.setConfig(file.global);
      }

      CHANNEL.info(`准备运行规则`);
      const result2 = await browser.runQueue(file.actions, this.inputValueObject$$());
      CHANNEL.info(`执行完成`);
      browser.browser.close();
      CHANNEL.info(`关闭浏览器`);
      return async (outputName: string) => {
        if (outputName === 'toString') {
          return {
            value: (result2 as any[])
              .map((item, index) => {
                return `索引:${index}\n${item.title}\n${item.content}`;
              })
              .join('\n---\n'),
            extra: {
              metadata: (result2 as any[]).map((item) => {
                return item.reference;
              }),
            },
          };
        }
        return {
          value: result2,
          extra: {
            metadata: (result2 as any[]).map((item) => {
              return item.reference;
            }),
          },
        };
      };
    }
  };
}
