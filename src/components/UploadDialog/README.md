# XUploadDialog 上传对话框

## API

> [Upload](https://www.antdv.com/components/upload-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `上传文件` |
| width | 宽度 | [String, Number] | `720` |
| fileList | 已经上传的文件列表 | Array | `[]` |
| imgZipFile | 图片压缩文件 | Object | `-` |
| attachmentZipFile | 附件压缩文件 | Object | `-` |
| customRequest | 自定义请求 | Function | `-` |
| customSubmit | 自定义提交 | Function | `-` |
| customUpload | 自定义上传 | Function | `-` |
| beforeUpload | 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传 | Function | `-` |
| accept | 上传文件格式`("image/*"、"application/*"、"audio/*"、"video/*"、"text/*")` | String | `-` |
| mode | 上传/预览模式`("upload"、"preview")` | String | `upload` |
| directory | 支持上传文件夹 | Boolean | `-` |
| multiple | 是否支持多选文件。开启后按住 ctrl 可选择多个文件。 | Boolean | `-` |
| size | 上传文件大小，单位`M` | Number | `500` |
| minWidth | 上传文件最小宽度，单位`px` | Number | `-` |
| maxWidth | 上传文件最大宽度，单位`px` | Number | `-` |
| minHeight | 上传文件最小高度，单位`px` | Number | `-` |
| maxHeight | 上传文件最大高度，单位`px` | Number | `-` |
| required | 是否必填 | Boolean | `-` |
| maxCount | 上传文件数量 | Number | `20` |

### Emits

```vue
emits: [
'update:visible',
'change',
'drop',
'preview',
'download',
'remove',
'done',
'downloadImgZipFile',
'downloadAttachmentZipFile'
],
```

### Slots

```vue
<slot></slot>
```

### Example

```vue
<x-upload-dialog :fileList="fileList" :customRequest="customRequest" :customSubmit="customSubmit"></x-upload-dialog>
```
