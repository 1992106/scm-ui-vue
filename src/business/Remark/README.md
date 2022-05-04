# XRemark 备注

## Components

> XModal
> 
> XTable
> 
> XUpload

## API

### Props

| 参数 | 说明 | 类型 | 默认值                                                                                        |
| --- | --- | --- |--------------------------------------------------------------------------------------------|
| v-model:visible | 是否显示 | Boolean | `false`                                                                                    |
| title | 标题 | String | `备注`                                                                                       |
| width | 宽度 | [String, Number] | `960`                                                                                      |
| scrollY | 表格滚动区域的高 | [String, Number] | `360`                                                                                      |
| maxlength | 备注长度 | Number | `200`                                                                                      |
| customRequest | 自定义请求 | Function | `-`                                                                                        |
| customSubmit | 自定义提交 | Function | `-`                                                                                        |
| customUpload | 自定义上传 | Function | `-`                                                                                        |
| size | 上传文件大小，单位M | Number | `3`                                                                                        |
| limit | 上传文件数量 | Number | `1`                                                                                        |
| showPagination | 是否显示分页 | Boolean | `true`                                                                                     |
| v-model:pagination | 当前页数和每页条数 | Object | `{ page: 1, pageSize: 10 }`                                                                |
| paginationConfig | 分页配置项 | Object | `{ size: 'small', defaultPageSize: 10, pageSizeOptions: ['10', '20', '30', '40'] }` |

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
