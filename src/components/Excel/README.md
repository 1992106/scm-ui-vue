# XExcelExcel&XImportExcel 导出&导入组件

## API

> [xlsx](https://github.com/SheetJS/sheetjs)

### 导出Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | -- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `导出数据` |
| width | 宽度 | [String, Number] | `520` |
| columns | 列字段 | Array | `[]` |
| dataSource | 数据 | Array | `[]` |
| fileName | 文件名 | String | `-` |
| sheetName | 工作表名 | String | `sheet` |
| bookType | 导出类型 | String | `xlsx` |
| customExport | 自定义导出 | Function | `-` |

### 导入Props
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | -- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `导出数据` |
| customImport | 自定义导入 | Function | `-` |
| customDownload | 自定义下载 | Function | `-` |
| limit | 限制导入数量 | Number | `500` |
| extra | 提示文案 | String | `-` |

### Emits

```vue
emits: ['update:visible', 'success', 'error']
```

### Example

```vue
<x-export-excel v-model:visible="visible" :columns="columns" :dataSource="excelData"></x-export-excel>

// 使用函数方法
useXExportExcel({ columns: columns, dataSource: excelData }, () => {
// 执行success事件
})
// 使用函数
exportExcel({ header: excelHeader, data: excelData, dataSource: excelData })
```

```vue
<x-import-excel v-model:visible="visible" :customImport="customImport" :customDownload="customDownload"></x-import-excel>

<x-import-excel v-model:visible="visible" :customImport="customImport">
  <a-button @click="handleDownload"></a-button>
</x-import-excel>

// 使用函数方法
useXImport({ customImport: customImport, customDownload: customDownload }, () => {
  // 执行done事件
})
// 使用函数
importExcel(file)
```
