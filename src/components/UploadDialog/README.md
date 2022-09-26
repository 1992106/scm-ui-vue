# XUploadDialog 上传对话框

## API

> [Upload](https://www.antdv.com/components/upload-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `上传文件` |
| width | 宽度 | [String, Number] | `720` |
| :fileList | 已经上传的文件列表 | Array | `[]` |
| customRequest | 自定义请求 | Function | `-` |
| customUpload | 自定义上传 | Function | `-` |
| beforeUpload | 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传 | Function | `-` |
| accept | 上传文件格式`("image/*"、"application/*"、"audio/*"、"video/*")` | String | `-` |
| directory | 支持上传文件夹 | Boolean | `false` |
| multiple | 是否支持多选文件。开启后按住 ctrl 可选择多个文件。 | Boolean | `false` |
| size | 上传文件大小，单位`M` | Number | `-` |
| maxWidth | 上传文件宽度，单位`px` | Number | `-` |
| maxHeight | 上传文件高度，单位`px` | Number | `-` |
| maxCount | 上传文件数量 | Number | `-` |

### Emits

```vue
emits: ['update:visible', 'done', 'change', 'drop', 'preview', 'download', 'remove'],
```

### Slots

```vue
<slot></slot>
```

### Example

```vue
<x-upload-dialog :fileList="fileList" :customRequest="customRequest"></x-upload-dialog>
```
