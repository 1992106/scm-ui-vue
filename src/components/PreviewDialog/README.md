# XPreview 预览

## API

> [Image](https://www.antdv.com/components/image-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `预览图片` |
| width | 宽度 | [String, Number] | `1200` |
| current | 图片索引 | Number | `0` |
| urls | 图片`src`集合 | Array | `[]` |

### Emits

```vue
emits: ['update:visible']
```

### Example

```vue
<x-preview-dialog v-model:visible="previewVisible" :current="previewCurrent" :urls="previewUrls"></x-preview-dialog>

// 使用函数方法
<!--createXPreview({ current: previewCurrent, urls: previewUrls })-->
```
