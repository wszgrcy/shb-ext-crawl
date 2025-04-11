import * as v from 'valibot';
import { ComponentContext, ComponentInput } from '@shenghuabi/sdk/componentDefine';
const SelectOptions = [
  { label: '标签1', value: 'value1', description: '标签1的描述' },
  { label: '标签2', value: 'value2', description: '标签1的描述' },
] as const;
// 节点的定义配置
export function NODE_DEFINE({ Action }: ComponentInput) {
  return v.object({
    // data必须存在,因为只有此定义下的数据才可以保存
    data: v.object({
      config: v.pipe(
        v.object({
          str1: v.pipe(v.optional(v.string(), '默认值'), v.title('文本1')),
          checkbox: v.pipe(v.optional(v.boolean(), false), v.title('开关1')),
          // 不在组件中显示,但是存在这个属性,可以用valueChange,hookDefine之类的变更
          onlyInDefine: v.pipe(v.optional(v.string(), 'inDefine'), Action.onlyDefine()),
          /** 静态选项 */
          select1: v.pipe(v.picklist(SelectOptions.map((item) => item.value)), Action.selectOptions(SelectOptions), v.title('选项1')),
          /** 动态选项 */
          select2: v.pipe(
            v.string(),
            v.title('选项2'),
            Action.condition({
              // 默认: 右侧的配置
              // config: 右侧的配置
              // display 直接显示在工作流中的
              environments: ['config'],
              actions: [
                Action.define({ type: 'picklist', inputs: { options: [] } }),
                Action.hookDefine({
                  allFieldsResolved(field) {
                    (field.context as ComponentContext).pluginMethod('getList').then((list) => {
                      field.inputs.update((inputs) => {
                        return { ...inputs, options: list };
                      });
                    });
                  },
                }),
              ],
            })
          ),
          str2: v.pipe(
            v.string(),
            v.title('文本2'),
            v.description('此输入直接显示在节点中'),
            Action.condition({
              environments: ['display'],
              actions: [
                Action.define({
                  type: 'string',
                  // 外面第一层是提示,显示description,第二层显示的是字段
                  wrappers: ['tooltip', 'form-field'],
                }),
              ],
            })
          ),
        }),
        Action.asColumn()
      ),
    }),
  });
}
