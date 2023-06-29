# XExcel 表格组件

## API

> [xlsx](https://github.com/SheetJS/sheetjs)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | -- |
| v-model:visible | 是否显示 | Boolean | `false` |
| columns | 列字段 | Array | `[]` |
| dataSource | 数据 | Array | `[]` |
| fileName | 文件名 | String | `-` |
| sheetName | 工作表名 | String | `sheet` |
| bookType | 导出类型 | String | `xlsx` |

### Emits

```vue
emits: ['update:visible']
```

### Example

```vue
<x-export-excel v-model:visible="excelVisible" :columns="columns" :dataSource="excelData"></x-export-excel>

// 使用函数方法
createXExportExcel({ columns: columns, dataSource: excelData })
// 使用函数
createExcel({ data: excelData, header: excelHeader })
```
