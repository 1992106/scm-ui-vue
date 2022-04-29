# XPage 页面

## API

> [Form](https://www.antdv.com/components/form-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:value | 搜索参数，包含分页、排序和筛选参数 | Object | `-` |
| searchProps | XSearch props | Object | `{}` |

#### searchProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 搜索栏的配置 | Array | `[]` |
| layout | 表单布局 | String | `horizontal` |
| labelCol | 标签布局 | Object | `{ span: 10 }` |
| wrapperCol | 控件布局 | Object | `{ span: 14 }` |
| resetSearch | 重置时是否触发搜索 | Boolean | `true` |
| clearSearch | 清空时是否触发搜索 | Boolean | `false` |
| showSearch | 是否显示搜索按钮 | Boolean | `true` |
| searchText | 搜索按钮文字 | Boolean | `搜索` |
| showReset | 是否显示重置按钮 | Boolean | `true` |
| resetText | 重置按钮文字 | Boolean | `重置` |
| showExpand | 是否显示展开/收起 | Boolean | `true` |
| defaultExpand | 默认展开 | Boolean | `false` |

### Emits

```vue
emits: ['update:value', 'search', 'reset', 'clear']
```

### Slots

```vue
<slot name="extra"></slot>
<slot name="shortcut"></slot>
<slot name="toolBar"></slot>

<slot></slot>
<slot name="renderItem"></slot>
```
