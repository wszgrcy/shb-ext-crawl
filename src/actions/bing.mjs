// index.js

/**
 * @typedef {import('../type').CrawlConfig} CrawlConfig
 */

/**
 * @type {CrawlConfig}
 */
const myObject = {
    global: { maxTimeout: 60_000 },
    actions: [{ type: 'setViewport', width: 1920, height: 1080 },
    { type: 'goto', url: 'https://www.bing.com', waitUntil: 'load' },
    { type: 'wait', config: { mode: 'selector', selector: 'h1 svg' } },
    { type: 'click', selector: 'form textarea' },
    { type: 'type', selector: 'form textarea', text: { source: 'variable', key: '$content' }, delay: 100 },
    { type: 'keypress', key: 'Enter' },
    { type: 'wait', config: { mode: 'selector', selector: 'main ol>li:has(h2) h2 a[href]' } },
    { type: 'selector', selector: 'main ol>li:has(h2) h2 a[href]', output: 'list', multi: true },
    { type: 'findData', kind: 'property', key: 'href', input: 'list', output: 'urlList' },
    // {type:'union'},
    {
        type: 'page',
        actions: [
            { type: 'setViewport', width: 1920, height: 1080 },
            { type: 'goto', url: { source: 'variable', key: '$item' }, waitUntil: 'networkidle2' },
            { type: 'getContent', output: 'data', cleanContent: true, format: 'markdown' },
            { type: 'extractMessage', output: 'data', input: 'data' },
        ],
        input: 'urlList',
        concurrency: 3
    },]
    , inputs: [{
        label: '搜索内容', value: '$content'
    }]
};

export default myObject;