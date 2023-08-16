import { computed, defineComponent, inject, PropType, unref } from 'vue'
import { Button, Drawer, Space, Spin } from 'ant-design-vue'
import type { ButtonProps, SpinProps } from 'ant-design-vue'
import './index.scss'

type ButtonType = 'link' | 'default' | 'primary' | 'ghost' | 'dashed' | 'text'

const drawerProps = {
  visible: { type: Boolean, default: false },
  class: String,
  width: { type: [String, Number], default: 'calc(100% - 320px)' },
  height: [String, Number]
}

const XDrawer = defineComponent({
  name: 'XDrawer',
  inheritAttrs: false,
  props: {
    ...drawerProps,
    manual: { type: Boolean, default: false },
    spinProps: { type: [Boolean, Object] as PropType<boolean | SpinProps>, default: false },
    confirmLoading: { type: Boolean, default: false },
    okType: { type: String as PropType<ButtonType>, default: 'primary' },
    okText: { type: String },
    okButtonProps: { type: Object as PropType<ButtonProps>, default: () => ({}) },
    cancelText: { type: String },
    cancelButtonProps: { type: Object as PropType<ButtonProps>, default: () => ({}) },
    afterClose: { type: Function }
  },
  emits: ['update:visible', 'cancel', 'ok', 'close', 'afterVisibleChange'],
  setup(props, { emit, slots, attrs, expose }) {
    const { antLocale } = inject('localeData', { antLocale: {} })
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    const handleAfterVisibleChange = (visible: boolean) => {
      emit('afterVisibleChange', visible)
      if (!visible) {
        props.afterClose?.()
      }
    }

    const handleCancel = (e: Event) => {
      if (!props.manual) {
        emit('update:visible', false)
      }
      emit('cancel', e)
      emit('close', e)
    }

    const handleOk = (e: Event) => {
      emit('ok', e)
    }

    const renderFooter = computed(() => {
      const footer = slots?.footer?.() || attrs?.footer
      return footer ? (
        footer
      ) : footer !== null ? (
        <Space>
          <Button {...props.cancelButtonProps} onClick={handleCancel}>
            {props.cancelText || antLocale['Modal']?.cancelText}
          </Button>
          <Button type={props.okType} {...props.okButtonProps} loading={props.confirmLoading} onClick={handleOk}>
            {props.okText || antLocale['Modal']?.okText}
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
        closeIcon={slots?.closeIcon?.() || attrs?.closeIcon}
        extra={slots?.extra?.() || attrs?.extra}
        footer={unref(renderFooter)}
        onClose={handleCancel}
        onAfterVisibleChange={handleAfterVisibleChange}>
        <Spin {...unref(spinProps)}>{slots?.default?.()}</Spin>
      </Drawer>
    )
  }
})

export default XDrawer
