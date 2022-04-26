# XModal 对话框

## API

> [Modal](https://www.antdv.com/components/modal-cn)

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:visible | 是否显示 | Boolean | `false` |
| draggable | 是否支持拖拽 | Boolean | `true` |
| showFullscreen | 是否支持全屏 | Boolean | `true` |
| fullscreen | 全屏 | Boolean | `false` |
| manual | 手动隐藏 | Boolean | `false` |
| spinProps | spin 加载中 props | [Boolean, Object] | `false` |
| confirmLoading | 确定按钮 loading | Boolean | `false` |
| okText | ok 按钮文字 | String | `确定` |
| okType | ok 按钮类型 | String | `primary` |
| okButtonProps | ok 按钮 props | Object | - |
| cancelText | cancel 按钮文字 | String | `取消` |
| cancelButtonProps | cancel 按钮 props | Object | - |

### Emits

```vue
emits: ['update:visible', 'cancel', 'ok', 'fullScreen']
```

### Slots

```vue
<slot name="title"></slot>
<slot name="footer"></slot>
```
