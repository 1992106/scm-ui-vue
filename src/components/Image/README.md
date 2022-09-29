# XImage 图片

## API

> [Image](https://www.antdv.com/components/image-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| thumbnail | 缩略图`src` | String | `''` |
| mode | 上传/预览模式`("simple"、"complex")` | String | `simple` |
| urls | 预览图片`src`集合 | Array | `[]` |
| previewList | 预览图片列表 | Array | `[]` |
| imgZipFile | 图片压缩文件 | Object | `-` |
| attachmentZipFile | 附件压缩文件 | Object | `-` |
| customRequest | 自定义请求 | Function | `-` |
| width | 宽度 | Number | `-` |
| height | 高度 | Number | `-` |
| preview | 是否支持预览 | Boolean | `true` |
| quality | 图片质量 | Number | `1` |

### Emits

```vue
emits: []
```

### Example

```vue
<x-image :thumbnail="thumbnail" :urls="previewUrls"></x-image>
```
