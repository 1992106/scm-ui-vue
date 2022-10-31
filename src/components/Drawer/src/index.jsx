import { computed, defineComponent, unref } from 'vue'
import { Button, Drawer, Space, Spin } from 'ant-design-vue'
import './index.scss'

const DrawerProps = {
  visible: { type: Boolean, default: false },
  class: String,
  width: { type: [String, Number], default: 'calc(100% - 320px)' },
  height: [String, Number]
}

const XDrawer = defineComponent({
  name: 'XDrawer',
  inheritAttrs: false,
  props: {
    ...DrawerProps,
    manual: { type: Boolean, default: false },
    spinProps: { type: [Boolean, Object], default: false },
    confirmLoading: { type: Boolean, default: false },
    okType: { type: String, default: 'primary' },
    okText: { type: String, default: '确定' },
    okButtonProps: Object,
    cancelText: { type: String, default: '取消' },
    cancelButtonProps: Object
  },
  emits: ['update:visible', 'cancel', 'ok'],
  setup(props, { emit, slots, attrs, expose }) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    const handleCancel = () => {
      if (!props.manual) {
        emit('update:visible', false)
      }
      emit('cancel')
    }

    const handleOk = () => {
      emit('ok')
    }

    const renderFooter = computed(() => {
      const footer = slots?.footer?.() || attrs?.footer
      return footer ? (
        footer
      ) : footer !== null ? (
        <Space>
          <Button {...props.cancelButtonProps} onClick={handleCancel}>
            {props.cancelText}
          </Button>
          <Button type={props.okType} {...props.okButtonProps} loading={props.confirmLoading} onClick={handleOk}>
            {props.okText}
          </Button>
        </Space>
      ) : null
    })

    expose({})

    return () => (
      <Drawer
        {...props}
        {...attrs}
        visible={props.visible}
        class={['x-drawer', props.class]}
        width={props.width}
        height={props.height}
        title={slots?.title?.() || attrs?.title}
        footer={unref(renderFooter)}
        onClose={handleCancel}>
        <Spin {...unref(spinProps)}>{slots?.default?.()}</Spin>
      </Drawer>
    )
  }
})

export default XDrawer
