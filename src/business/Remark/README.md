# XRemark 备注

## Components

> XModal
> 
> XTable
> 
> XUpload

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| title | 标题 | String | `备注` |
| width | 宽度 | [String, Number] | `960` |
| scrollY | 表格滚动区域的高 | [String, Number] | `400` |
| maxlength | 备注长度 | Number | `200` |
| customRequest | 自定义请求 | Function | `-` |
| customSubmit | 自定义提交 | Function | `-` |
| customUpload | 自定义上传 | Function | `-` |
| size | 上传文件大小，单位M | Number | `3` |
| limit | 上传文件数量 | Number | `1` |

### Emits

```vue
emits: ['update:visible', 'done']
```

### Example

```vue
<x-remark v-model:visible="visible" :customRequest="customRequest" :customSubmit="customSubmit" @done="handleDone"></x-remark>

// 使用函数方法
createXRemark({ customRequest: customRequest, customSubmit: customSubmit }, () => {
  // 执行done事件
})
```
