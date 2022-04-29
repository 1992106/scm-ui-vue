# XProGrid 网格

## API

> [Form](https://www.antdv.com/components/form-cn) + [vxe-grid](https://vxetable.cn/v4/#/grid/api)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:value | 搜索参数，包含分页、排序和筛选参数 | Object | `-` |
| searchProps | XSearch props | Object | `{}` |
| gridProps | XGrid props | Object | `{}` |

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

#### gridProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表格列的配置 | Array | `[]` |
| data | 表格的数据 | Array | `[]` |
| loading | 表格 loading | Boolean | `false` |
| total | 数据总数 | Number | `0` |
| emptyText | 空数据显示的内容 | Function | `暂无数据` |
| showPagination | 是否显示分页 | Boolean | `true` |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 20 }` |
| paginationConfig | 分页配置项 | Object | `{ size: 'default', defaultPageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `共 ${total} 条`, pageSizeOptions: ['20', '40', '60', '80', '100'] }` |
| height | 表格高度 | [Number, String] | `auto` |
| autoResize | 表格高度 | Boolean | `true` |
| rowConfig | 行配置项 | Object | `{ isHover: true, isCurrent: true }` |
| columnConfig | 列配置项 | Object | `{ resizable: true }` |
| seqConfig | 序号配置项 | Object | `-` |
| radioConfig | 单选框配置项 | Object | `{ highlight: true }` |
| checkboxConfig | 复选框配置项 | Object | `{ highlight: true }` |
| v-model:selectedValue | 勾选数据，行数据 | Array | `[]` |
| mergeCells | 自定义缩放 | Array | `-` |
| footerMethod | 自定义缩放 | Function | `-` |
| customZoom | 自定义缩放 | Boolean | `true` |
| customSetting | 自定义设置 | Boolean | `true` |
| storageName | 本地Storage名称，拖拽列和自定义表头时本地储存 | String | `-` |

### Emits

```vue
emits: ['update:value', 'search', 'reset', 'clear']
```

### Slots

```vue
<slot name="extra"></slot>
<slot name="shortcut"></slot>
<slot name="toolBar"></slot>

// XGrid插槽
<slot name="default"></slot>
<slot name="header"></slot>
<slot name="footer"></slot>
<slot name="title"></slot>
<slot name="edit"></slot>
<slot name="filter"></slot>
<slot name="checkbox"></slot>
<slot name="radio"></slot>
<slot name="content"></slot>
<slot name="emptyText"></slot>
```