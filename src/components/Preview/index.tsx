import { ref, defineComponent, watch, PropType, Ref } from 'vue'
import { Image } from 'ant-design-vue'

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
    const visible = ref(false)
    const current: Ref<number> = ref(0)

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
          visible.value = val
          if (props.urls.length <= 1) {
            current.value = 0
          }
        }
      }
    )

    const handlePreview = (bool, index) => {
      visible.value = bool
      setCurrent(index)
      emit('update:visible', bool)
    }

    return () => (
      <>
        {visible.value && props.urls.length > 0 && (
          <Image.PreviewGroup>
            {props.urls.map((url, index) => (
              <Image
                style={{ display: 'none' }}
                preview={{
                  visible: current.value === index,
                  onVisibleChange: bool => handlePreview(bool, index)
                }}
                src={url}
              />
            ))}
          </Image.PreviewGroup>
        )}
      </>
    )
  }
})

export default XPreview
