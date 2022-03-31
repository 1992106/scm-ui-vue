import { ref, defineComponent, computed, reactive, watch, PropType, Ref } from 'vue'
import Preview from 'ant-design-vue/es/vc-image/src/Preview'
import { context } from 'ant-design-vue/es/vc-image/src/PreviewGroup'

const XPreview = defineComponent({
  name: 'XPreview',
  inheritAttrs: false,
  props: {
    visible: { type: Boolean as PropType<boolean>, default: false },
    urls: { type: Array as PropType<string[]>, required: true },
    current: { type: Number as PropType<number>, default: 0 }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const previewUrls: Record<number, string> = reactive({})
    const current: Ref<number> = ref(0)
    const isPreviewGroup: Ref<boolean> = ref(false)

    const isShowPreview = computed({
      get: () => props.visible,
      set: val => {
        emit('update:visible', val)
      }
    })

    const setCurrent = (val: number) => {
      current.value = val
    }

    watch(
      () => props.current,
      val => setCurrent(val),
      { immediate: true }
    )

    watch(
      () => props.visible,
      val => {
        if (val) {
          props.urls.forEach((item, idx) => {
            previewUrls[idx] = item
          })
          isPreviewGroup.value = props.urls.length > 1
          if (props.urls.length <= 1) {
            current.value = 0
          }
        }
      }
    )

    const onPreviewClose = (e: Event) => {
      e?.stopPropagation()
      isShowPreview.value = false
      emit('update:visible', false)
      Object.keys(previewUrls).forEach(key => {
        delete previewUrls[key as unknown as number]
      })
      current.value = props.current
    }

    context.provide({
      isPreviewGroup,
      previewUrls,
      current,
      setCurrent,
      setPreviewUrls: () => {},
      setShowPreview: () => {},
      setMousePosition: () => {},
      registerImage: () => () => {}
    })

    return () => (
      <Preview
        ria-hidden={!isShowPreview.value}
        visible={isShowPreview.value}
        prefixCls='ant-image-preview'
        onClose={onPreviewClose}
        src={previewUrls[current.value]}
      />
    )
  }
})

export default XPreview
