# XSearch 搜索栏

## API

> [Form](https://www.antdv.com/components/form-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 搜索栏配置 | Array | `[]` |
| layout | 表单布局 | String | `inline` |
| labelCol | 标签布局 | Object | `{}` |
| wrapperCol | 控件布局 | Object | `{}` |
| resetSearch | 重置时是否触发搜索 | Boolean | `true` |
| clearSearch | 清空时是否触发搜索 | Boolean | `false` |
| showSearch | 是否显示搜索按钮 | Boolean | `true` |
| searchText | 搜索按钮文字 | Boolean | `搜索` |
| showReset | 是否显示重置按钮 | Boolean | `true` |
| resetText | 重置按钮文字 | Boolean | `重置` |
| showExpand | 是否显示展开/收起 | Boolean | `false` |
| defaultExpand | 默认展开 | Boolean | `false` |

### Emits

```vue
emits: ['search', 'reset', 'clear']
```

### Slots

```vue
<slot name="extra"></slot>
<slot name="shortcut"></slot>
```
