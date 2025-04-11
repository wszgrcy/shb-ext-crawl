import * as v from 'valibot';
import { ComponentInput } from '@shenghuabi/sdk/componentDefine';
import { LLM_CONFIG } from '../../../../define/llm.define';

export function NODE_DEFINE({ Action }: ComponentInput) {
  return v.object({
    data: v.pipe(
      v.object({
        config: v.pipe(
          v.object({
            searchLLM: v.optional(LLM_CONFIG('搜索对话配置', { Action })),
            summaryLLM: v.optional(LLM_CONFIG('总结对话配置', { Action })),
          }),
          Action.asColumn()
        ),
        value: v.pipe(
          v.string(),
          v.title('搜索内容'),
          v.description('请输入搜索内容'),
          Action.condition({
            environments: ['default', 'display'],
            actions: [
              Action.define({
                type: 'string',
                wrappers: ['tooltip', 'form-field'],
              }),
              Action.valueChange({
                list: [undefined],
                debounceTime: 100,
                when: ([value]: string[], field) => {
                  // xxx{{xxx}}
                  field.context.changeHandleByTemplate(field, value, 1);
                },
              }),
            ],
          })
        ),
      }),
      Action.asColumn()
    ),
  });
}
