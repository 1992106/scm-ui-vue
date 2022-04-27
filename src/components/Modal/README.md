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
| okButtonProps | ok 按钮 props | Object | `-` |
| cancelText | cancel 按钮文字 | String | `取消` |
| cancelButtonProps | cancel 按钮 props | Object | `-` |

### Emits

```vue
emits: ['update:visible', 'cancel', 'ok', 'fullScreen']
```

### Slots

```vue
<slot name="title"></slot>
<slot name="footer"></slot>
```

### Example

```vue
<template>
  <x-modal
    v-model:visible="modalVisible"
    title="对话框"
    :width="960"
    :spinProps="spinning"
    :confirmLoading="confirmLoading"
    destroy-on-close
    @ok="handleOk">
    <div>对话框例子</div>
  </x-modal>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue'

export default defineComponent({
  name: 'MyModal',
  props: {
    visible: { type: Boolean, default: false }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    // 使用computed时，不需要绑定@cancel手动关闭
    const modalVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      confirmLoading: false
    })
    
    const handleOk = () => {
      emit('done')
    }
    
    return {
      ...toRefs(state),
      modalVisible,
      handleOk
    }
  }
})
</script>
```

```vue
<template>
  <x-modal
    v-model:visible="modalVisible"
    title="对话框"
    :width="960"
    :spinProps="spinning"
    :confirmLoading="confirmLoading"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleOk">
    <div>对话框例子</div>
  </x-modal>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect } from 'vue'

export default defineComponent({
  name: 'MyModal',
  props: {
    visible: { type: Boolean, default: false }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const state = reactive({
      modalVisible: false,
      spinning: false,
      confirmLoading: false
    })

    watchEffect(() => {
      state.modalVisible = props.visible
    })
    
    const handleCancel = () => {
      emit('update:visible', false)
    }
    
    const handleOk = () => {
      handleCancel()
      emit('done')
    }
    
    return {
      ...toRefs(state),
      handleCancel,
      handleOk
    }
  }
})
</script>
```
