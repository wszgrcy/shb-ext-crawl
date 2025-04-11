import { ComponentInput } from '@shenghuabi/sdk/componentDefine';
import * as v from 'valibot';

export function LLM_CONFIG(label: string, { Action }: ComponentInput) {
  return v.pipe(
    v.intersect([
      v.pipe(
        v.object({
          model: v.pipe(v.optional(v.string()), v.title('模型')),
          configuration: v.optional(
            v.object({
              baseURL: v.pipe(v.string(), v.title('地址')),
            })
          ),
        }),
        v.title(label),
        Action.asColumn()
      ),
    ]),
    Action.asVirtualGroup(),
    Action.define({
      type: 'accordion',
    })
  );
}
