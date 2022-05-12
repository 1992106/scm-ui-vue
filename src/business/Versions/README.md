# XVersions 版型库

## Components

> XModal
> XSearch
> XTable
> XForm

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `版型库` |
| width | 宽度 | [String, Number] | `80%` |
| height | 高度 | [String, Number] | `-` |
| rowKey | 表格行 key 的取值，可以是字符串或一个函数 | [String, Function] | `id` |                                                                  |
| manual | 是否手动控制搜索 | Boolean | `false` |
| searchProps | XSearch props | Object | `{}` |
| shortcutProps | XForm props | Object | `{}` |
| customRequest | 自定义请求 | Function | `-` |
| rowProps |a-row props | Object | `-` |
| colProps | a-col props | Object | `-` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |

### Emits

```vue
emits: ['update:visible', 'done', 'search', 'reset']
```

### Slots

```vue
<slot name="renderItem"></slot>
```

### Example

```vue
<x-versions v-model:visible="visible" :searchProps="searchProps" :shortcutProps="shortcutProps" :customRequest="customRequest" @done="handleDone"></x-versions>
```
