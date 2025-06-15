import * as v from 'valibot';
import { ComponentContext, ComponentInput } from '@shenghuabi/sdk/componentDefine';
import { debounceTime } from 'rxjs';

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
              Action.valueChange((fn) => {
                fn({
                  list: [undefined],
                })
                  .pipe(debounceTime(100))
                  .subscribe(({ list: [value], field }) => {
                    const context = field.context as ComponentContext;
                    context!
                      .pluginMethod('getRuleInput', [value])
                      .then((list) => {
                        return list;
                      })
                      .then((list) => context.changeHandleData(field, 'input', 1, list));
                  });
              }),
            ],
          })
        ),
      }),
      Action.asColumn()
    ),
  });
}
