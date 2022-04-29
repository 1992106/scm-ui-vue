# XTable 表格

## API

> [Table](https://www.antdv.com/components/table-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| rowKey | 表格行 key 的取值，可以是字符串或一个函数 | [String, Function] | `key` |
| columns | 表格列的配置 | Array | `[]` |
| dataSource | 表格的数据 | Array | `[]` |
| loading | 表格 loading | Boolean | `false` |
| total | 数据总数 | Number | `0` |
| transformCellText | 单元格自定义显示，一般用于空数据默认显示 | Function | `--` |
| showPagination | 是否显示分页 | Boolean | `true` |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 20 }` |
| paginationConfig | 分页配置项 | Object | `{ size: 'default', defaultPageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `共 ${total} 条`, pageSizeOptions: ['20', '40', '60', '80', '100'] }` |
| extraHeight | 额外高度 | Number | `-` |
| autoResize | 自动计算表格 | Boolean | `false` |
| scroll | 表格是否可滚动，也可以指定滚动区域的宽、高 | Object | `{ x: true, scrollToFirstRowOnChange: true }` |
| rowSelection | 列表项是否可选择 | Object | `{ type: 'checkbox', fixed: true, columnWidth: 50 }` |
| v-model:selectedValue | 勾选数据，rowKey 指定的值 | Array | `[]` |
| locale | 默认文案设置，目前包括排序、过滤、空数据文案 | Object | `{ filterConfirm: '筛选', filterReset: '重置', emptyText: '暂无数据' }` |

### Emits

```vue
emits: [
'search',
'update:pagination',
'update:selected-value',
'radio-change',
'checkbox-change',
'select',
'select-all',
'change',
'expand',
'expandedRowsChange',
'resizeColumn'
]
```

### Slots

```vue
<slot name="searchBar"></slot>
<slot name="toolBar"></slot>

// XTable插槽
<slot name="headerCell"></slot>
<slot name="bodyCell"></slot>
<slot name="customFilterDropdown"></slot>
<slot name="customFilterIcon"></slot>
<slot name="expandedRowRender"></slot>
<slot name="expandIcon"></slot>
<slot name="summary"></slot>
<slot name="title"></slot>
<slot name="footer"></slot>
<slot name="emptyText"></slot>
```