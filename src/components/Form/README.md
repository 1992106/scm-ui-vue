# XForm 表单

## API

> [Form](https://www.antdv.com/components/form-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表单配置 | Array | `[]` |
| layout | 表单布局 | String | `inline` |
| labelCol | 标签布局 | Object | `{}` |
| wrapperCol | 控件布局 | Object | `{}` |
| gird | 是否栅格化布局 | Boolean | `false` |
| rowProps |a-row props | Object | `{}` |
| colProps | a-col props | Object | `{}` |
| expand | 是否收起（用于控制搜索栏显示/隐藏） | Boolean | `true` |

### Emits

```vue
emits: ['enter', 'clear']
```

### Slots

```vue
<slot></slot>
```

### Methods

```vue
// 重置表单
onResetFields()

// 获取表单值
onGetFormValues()

// 设置表单字段和值
onSetFieldValue({ field: value})
```
