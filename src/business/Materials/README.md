# XMaterials 物料档案

## Components

> XModal
> XSearch
> XTable

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `物料档案` |
| width | 宽度 | [String, Number] | `80%` |
| height | 高度 | [String, Number] | `-` |
| rowKey | 表格行 key 的取值 | String | `supplierMaterialId` |                                                                  |
| manual | 是否手动控制搜索 | Boolean | `false` |
| searchProps | XSearch props | Object | `{}` |
| customRequest | 自定义请求 | Function | `-` |
| selectedType | 选择模式(checkbox/radio) | String | `checkbox` |
| emptyText | 空数据显示的内容 | String | `暂无数据` |

### Emits

```vue
emits: ['update:visible', 'done', 'search', 'reset']
```

### Example

```vue
<x-materials v-model:visible="visible" :searchProps="searchProps" :customRequest="customRequest" @done="handleDone"></x-materials>
```
