import * as v from 'valibot';
import { ComponentContext, ComponentInput } from '@shenghuabi/sdk/componentDefine';
import { LLM_CONFIG } from '../../../../define/llm.define';

export function NODE_DEFINE({ Action }: ComponentInput) {
  return v.object({
    data: v.pipe(
      v.object({
        value: v.pipe(
          v.string(),
          v.title('拉取规则'),
          Action.condition({
            environments: ['default', 'display'],
            actions: [
              Action.define({
                type: 'button-input',
                inputs: (context: ComponentContext) => {
                  return {
                    icon: 'attach_file',
                    clicked: () => {
                      return context.pluginMethod('getFileContent');
                    },
                  };
                },
              }),
              Action.valueChange({
                list: [undefined],
                debounceTime: 100,
                when: ([value]: any[], field) => {
                  console.log('值',value);
                  
                  let context = field.context as ComponentContext;
                  context!
                    .pluginMethod('getRuleInput', [value])
                    .then((list) => {
                      console.log(list);
                      return list;
                    })
                    .then((list) => context.changeHandleData(field, 'input', 1, list));
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
