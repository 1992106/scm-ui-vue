import { computed, defineComponent, PropType, ref, toRefs, unref, watchEffect } from 'vue'
import { Modal, Spin } from 'ant-design-vue'
import { CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { useModalDragMove } from './useModalDrag'
import './index.scss'

type SpinProps = {
  prefixCls?: string
  spinning?: boolean
  size?: 'default' | 'small' | 'large'
  wrapperClassName?: string
  tip?: string
  delay?: number
  indicator?: any
}

const ModalProps = {
  visible: Boolean,
  destroyOnClose: Boolean,
  wrapClassName: String
}

const XModal = defineComponent({
  name: 'XModal',
  inheritAttrs: false,
  props: {
    ...ModalProps,
    draggable: { type: Boolean, default: true },
    showFullscreen: { type: Boolean, default: true },
    fullscreen: { type: Boolean, default: false },
    manual: { type: Boolean, default: false },
    spinProps: { type: [Boolean, Object] as PropType<boolean | SpinProps>, default: false }
  },
  emits: ['update:visible', 'cancel', 'ok', 'fullScreen'],
  setup(props, ctx) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    // 拖拽
    const { visible, draggable, destroyOnClose } = toRefs(props)
    useModalDragMove({
      visible,
      destroyOnClose,
      draggable
    })

    // 全屏
    const fullScreenRef = ref(false)
    watchEffect(() => {
      fullScreenRef.value = props.fullscreen
    })

    const handleFullScreen = (e: Event) => {
      e?.stopPropagation()
      e?.preventDefault()
      fullScreenRef.value = !unref(fullScreenRef)
      ctx.emit('fullScreen', fullScreenRef.value)
    }

    const renderIcon = () => {
      return props?.showFullscreen ? (
        <div class='x-model-close-fullscreen'>
          {props.fullscreen ? (
            <FullscreenExitOutlined onClick={handleFullScreen} />
          ) : (
            <FullscreenOutlined onClick={handleFullScreen} />
          )}
          <CloseOutlined />
        </div>
      ) : (
        <CloseOutlined />
      )
    }

    const wrapClassName = computed(
      () =>
        `${props.wrapClassName ? props.wrapClassName : ''}
        ${unref(fullScreenRef) ? 'x-model-fullscreen' : ''}`
    )

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
      <Modal
        {...props}
        {...ctx.attrs}
        wrapClassName={unref(wrapClassName)}
        closeIcon={renderIcon()}
        title={ctx.slots?.title?.() || ctx.attrs?.title}
        footer={ctx.slots?.footer?.() || ctx.attrs?.footer}
        onCancel={handleCancel}
        onOk={handleOk}>
        <Spin {...unref(spinProps)}>{ctx.slots?.default && ctx.slots?.default()}</Spin>
      </Modal>
    )
  }
})

export default XModal
