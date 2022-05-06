# XVersions 版型库

## Components

> XModal
> XSearch
> XTable

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `操作日志` |
| width | 宽度 | [String, Number] | `80%` |
| height | 高度 | [String, Number] | `-` |
| rowKey | 表格行 key 的取值 | String | `id` |                                                                  |
| scrollY | 表格滚动区域的高 | [String, Number] | `400`
| manual | 是否手动搜索 | Boolean | `false` |
| searchProps | XSearch props | Object | `{}` |
| shortcutProps | XForm props | Object | `{}` |
| customRequest | 自定义请求 | Function | `-` |
| rowProps |a-row props | Object | `-` |
| colProps | a-col props | Object | `-` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |

### Emits

```vue
emits: ['update:visible', 'done']
```

### Slots

```vue
<slot name="renderItem"></slot>
```

### Example

```vue
<x-versions v-model:visible="visible" :searchProps="searchProps" :shortcutProps="shortcutProps" :customRequest="customRequest" @done="handleDone"></x-versions>

// 使用函数方法
createXVersions({ searchProps: searchProps, shortcutProps: shortcutProps, customRequest: customRequest }, () => {
  // 执行done事件
})
```
