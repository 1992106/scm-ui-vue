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
| searchProps | XSearch props | Object | `{}` |
| shortcutProps | 快捷搜索 props | Object | `{}` |
| tableProps | XTable props | Object | `{}` |
| customRequest | 自定义请求 | Function | `-` |
| manual | 是否手动搜索 | Boolean | `false` |

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
