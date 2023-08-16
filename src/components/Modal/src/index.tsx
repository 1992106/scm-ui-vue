import { computed, defineComponent, PropType, ref, toRefs, unref, watchEffect } from 'vue'
import { Modal, Spin } from 'ant-design-vue'
import type { SpinProps } from 'ant-design-vue'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { useModalDragMove } from './useModalDrag'
import './index.scss'

const modalProps = {
  visible: Boolean,
  destroyOnClose: Boolean,
  wrapClassName: String,
  class: String
}

const XModal = defineComponent({
  name: 'XModal',
  inheritAttrs: false,
  props: {
    ...modalProps,
    draggable: { type: Boolean, default: true },
    showFullscreen: { type: Boolean, default: true },
    fullscreen: { type: Boolean, default: false },
    manual: { type: Boolean, default: false },
    spinProps: { type: [Boolean, Object] as PropType<boolean | SpinProps>, default: false }
  },
  emits: ['update:visible', 'cancel', 'ok', 'fullScreen'],
  setup(props, { emit, slots, attrs, expose }) {
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
    const canFullscreen = ref(false)
    watchEffect(() => {
      canFullscreen.value = props.fullscreen
    })

    const handleFullscreen = (e: Event) => {
      e?.stopPropagation()
      e?.preventDefault()
      canFullscreen.value = !unref(canFullscreen)
      emit('fullScreen', canFullscreen.value)
    }

    const wrapClassName = computed(() =>
      [props.wrapClassName, `${unref(canFullscreen) ? 'x-modal__fullscreen' : ''}`].filter(Boolean).join(' ')
    )

    const handleCancel = (e: Event) => {
      if (!props.manual) {
        emit('update:visible', false)
      }
      emit('cancel', e)
    }

    const handleOk = (e: Event) => {
      emit('ok', e)
    }

    const renderTitle = computed(() => {
      const title = slots?.title?.() || attrs?.title
      return props.showFullscreen ? (
        <>
          {title}
          <span class='x-modal__fullscreen-action'>
            {props.fullscreen ? (
              <FullscreenExitOutlined onClick={handleFullscreen} />
            ) : (
              <FullscreenOutlined onClick={handleFullscreen} />
            )}
          </span>
        </>
      ) : (
        title
      )
    })

    expose({})

    return () => (
      <Modal
        {...props}
        {...attrs}
        wrapClassName={unref(wrapClassName)}
        class={['x-modal', `${props.showFullscreen ? 'is-fullscreen' : ''}`, props?.class]}
        title={unref(renderTitle)}
        closeIcon={slots?.closeIcon?.() || attrs?.closeIcon}
        footer={slots?.footer?.() || attrs?.footer}
        onCancel={handleCancel}
        onOk={handleOk}>
        <Spin {...unref(spinProps)}>{slots?.default?.()}</Spin>
      </Modal>
    )
  }
})

export default XModal
