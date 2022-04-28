# XExportPDF 导出PDF

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| showButton | 是否显示按钮 | Boolean | `true` |
| buttonText | 按钮文字 | Boolean | `导出PDF` |
| buttonProps | 按钮 props | Object | `-` |
| fileName | PDF文件名 | String | `''` |
| onBefore | 导出前的回调 | Function | `-` |

### Emits

```vue
emits: ['done']
```

### Slots

```vue
<slot name="icon"></slot>
<slot></slot>
```

### Example

```vue
<x-exportPDF
  :onBefore="onBefore"
  buttonText="导出PDF"
  :buttonProps="{ type: 'primary', loading }">
</x-exportPDF>
```
