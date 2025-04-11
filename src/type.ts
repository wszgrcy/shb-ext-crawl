import { ActionItemInputType, GlobalConfigInputType } from '@cyia/crawl';

export interface CrawlConfig {
  global: GlobalConfigInputType;
  // 添加自定义类型
  actions: ActionItemInputType[];
  inputs: {
    label: string;
    value: string;
  }[];
}
