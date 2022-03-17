import { computed, defineComponent, unref } from 'vue'
import { Button, Drawer, Space, Spin } from 'ant-design-vue'
import './index.scss'

const MyDrawer = defineComponent({
  name: 'VDrawer',
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    manual: { type: Boolean, default: false },
    spinProps: { type: [Boolean, Object], default: false },
    width: { type: String, default: 'calc(100% - 320px)' },
    height: String,
    confirmLoading: { type: Boolean, default: false },
    okText: { type: String, default: '确定' },
    okType: { type: String, default: 'primary' },
    okButtonProps: Object,
    cancelText: { type: String, default: '取消' },
    cancelButtonProps: Object
  },
  emits: ['update:visible', 'cancel', 'ok'],
  setup(props, ctx) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    const handleCancel = () => {
      if (!props.manual) {
        ctx.emit('update:visible', false)
      }
      ctx.emit('cancel')
    }

    const handleOk = () => {
      ctx.emit('ok')
    }

    return () => (
      <Drawer
        {...ctx.attrs}
        visible={props.visible}
        class={['my-drawer', ctx.attrs?.footer === null ? '' : 'footer']}
        width={props.width}
        height={props.height}
        title={ctx.slots?.title || ctx.attrs?.title}
        onClose={handleCancel}
      >
        <Spin {...unref(spinProps)}>{ctx.slots?.default && ctx.slots?.default()}</Spin>
        {ctx.slots?.footer
          ? ctx.slots?.footer()
          : ctx.attrs?.footer !== null && (
              <div className='my-drawer-button'>
                <Space>
                  <Button {...props.cancelButtonProps} onClick={handleCancel}>
                    {props.cancelText}
                  </Button>
                  <Button
                    type={props.okType}
                    {...props.okButtonProps}
                    loading={props.confirmLoading}
                    onClick={handleOk}
                  >
                    {props.okText}
                  </Button>
                </Space>
              </div>
            )}
      </Drawer>
    )
  }
})

export default MyDrawer
