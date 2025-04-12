import { ManifestInput } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from '../common/define';
import { init } from '@cyia/crawl';
import { PublicExplorer } from 'cosmiconfig';
const toMarkdown = (content: string) => `你是一个信息提取专家
用户的搜索主题为: "${content}"
请根据用户的搜索主题提取输入内容,提取规则如下
1. 只提取输入内容中符合搜索主题的内容
2. 排除所有与搜索主题无关的内容
3. 返回内容应该尽可能简单有效
4. 如果该页面没有可以提取的内容,请返回'无可用内容'

提取完成后,直接返回`;

export function NetworkSearchRunner(input: ManifestInput, explorer: PublicExplorer, dir: string) {
  return class extends input.provider.workflow.NodeRunnerBase {

    override async run() {
      const instance = this.injector.get(input.provider.root.ChatService);
      const content = this.inputValueObject$$()['$content'];
      const browser = await init({ cacheDir: dir, headless: false });
      this.abortSignal?.addEventListener(
        'abort',
        () => {
          browser.browser.close();
        },
        { once: true }
      );
      browser.registerCustom('extractMessage', async (input, page) => {
        const streamData = this.emitter.createLLMData({
          node: this.node,
          value: '',
          extra: {
            historyList: [],
            delta: '',
            content: '',
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
        return { title: await page.page.title(), content: streamData.value };
      });
      const data = this.getParsedNode(NODE_DEFINE(input.componentDefine));
      const file = await explorer.load(data.data.value).then((item) => item?.config);
      if (file.global) {
        browser.setConfig(file.global);
      }
      console.log('输入变量', this.inputValueObject$$());

      const result2 = await browser.runQueue(file.actions, this.inputValueObject$$());
      browser.browser.close();
      return async (outputName: string) => {
        if (outputName === 'toString') {
          return {
            value: (result2 as any[]).map((item) => {
              return `${item.title}\n${item.content}`;
            }),
            extra: {
              metadata: [],
            },
          };
        }
        return {
          value: result2,
        };
      };
    }
  };
}
