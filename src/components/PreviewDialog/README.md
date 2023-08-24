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
| previewList | 预览图片列表 | Array | `[]` |
| imgZipFile | 图片压缩文件 | Object | `-` |
| attachmentZipFile | 附件压缩文件 | Object | `-` |
| customRequest | 自定义请求 | Function | `-` |

### Emits

```vue
emits: ['update:visible', 'download', 'downloadImgZipFile', 'downloadAttachmentZipFile']
```

### Example

```vue
<x-preview-dialog v-model:visible="previewVisible" :current="previewCurrent" :fileList="previewList"></x-preview-dialog>
```
