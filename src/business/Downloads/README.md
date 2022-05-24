# XDownload 下载中心

## Components

> XTrigger

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `下载中心` |
| width | 宽度 | [String, Number] | `360` |
| height | 高度 | [String, Number] | `520` |
| rowKey | key 的取值，可以是字符串或一个函数 | [String, Function] | `id` |
| customRequest | 自定义请求 | Function | `-` |
| customDownload | 自定义下载 | Function | `-` |
| customCancel | 自定义取消 | Function | `-` |
| customDelete | 自定义删除 | Function | `-` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |

### Emits

```vue
emits: ['update:visible', 'toggle']
```

### Slots

```vue
<slot name="itemRender"></slot>
```

### Example

```vue
<x-downloads v-model:visible="visible" :customRequest="customRequest" :customDownload="customDownload" :customCancel="customCancel" @toggle="handleToggle"></x-downloads>
```
