import { defineComponent, ref, computed, PropType, watch } from 'vue'
import { Image, Space } from 'ant-design-vue'
import XPreview from '@components/Preview/index.vue'
import { isObject } from 'lodash-es'
import { compressImage } from '@src/utils'
import './index.scss'

type PreviewField = string | string[] | { url?: string; src?: string; thumbUrl?: string }[]

const fallUrl =
  'data:image/png;base64,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'

const XImage = defineComponent({
  name: 'XImage',
  inheritAttrs: false,
  props: {
    thumbnail: { type: String as PropType<string>, default: '' },
    urls: { type: [String, Array] as PropType<PreviewField>, default: () => [] },
    width: { type: [String, Number] as PropType<number | string> },
    height: { type: [String, Number] as PropType<number | string> },
    preview: { type: Boolean as PropType<boolean>, default: true },
    quality: { type: Number as PropType<number>, default: 1 }
  },
  setup(props, ctx) {
    const visible = ref(false)
    const current = ref(0)

    const previewUrls = computed((): string[] => {
      // 处理字符串
      if (typeof props.urls === 'string' && props.urls) {
        return [props.urls]
      }

      // 处理数组
      const srcs = Array.isArray(props.urls)
        ? props.urls
            .map(item => (isObject(item as PreviewField) ? item?.src ?? item?.url ?? item?.thumbUrl ?? '' : item))
            .filter(Boolean)
        : []

      // 如果预览列表为空则把缩略图扔进去
      if (!srcs.length && props.thumbnail) {
        return [props.thumbnail]
      }

      return srcs
    })

    const thumbUrls = computed((): string[] => {
      if (props.thumbnail) {
        return [props.thumbnail]
      }
      // 当缩略图没有的时候，把urls当成缩略图
      return props.urls
        ? typeof props.urls === 'string'
          ? [props.urls]
          : Array.isArray(props.urls)
          ? props.urls
              .map(item => (isObject(item as PreviewField) ? item?.thumbUrl ?? item?.src ?? item?.url ?? '' : item))
              .filter(Boolean)
          : []
        : []
    })

    const compressUrls = ref(thumbUrls.value.map(() => fallUrl))

    watch(
      thumbUrls,
      () => {
        if (thumbUrls.value.length) {
          const { width, height, quality } = props
          Promise.allSettled(thumbUrls.value.map(url => compressImage(url, width, height, quality)))
            .then(res => {
              // @ts-ignore
              compressUrls.value = res.map((v, i) => {
                return v.status === 'fulfilled' ? v.value : previewUrls.value[i]
              })
            })
            .catch(() => {
              compressUrls.value = previewUrls.value
            })
        } else {
          // 图为空时，使用默认图片展示
          compressUrls.value = [fallUrl]
        }
      },
      { immediate: true }
    )

    const handlePreview = (index: number) => {
      // 图片为空时，不支持预览功能
      if (!thumbUrls.value.length) {
        return
      }
      visible.value = true
      current.value = index
    }

    return () => (
      <>
        {compressUrls.value.length === 1 ? (
          <Image
            {...ctx.attrs}
            style={{ cursor: 'pointer' }}
            width={props.width}
            height={props.height}
            src={compressUrls.value[0]}
            preview={false}
            // @ts-ignore
            onClick={() => handlePreview(index)}
            fallback={fallUrl}
          />
        ) : (
          // 相册模式
          <Space>
            {compressUrls.value.map((src, index) => (
              <Image
                {...ctx.attrs}
                key={index}
                style={{ cursor: 'pointer' }}
                width={props.width}
                height={props.height}
                src={src}
                preview={false}
                // @ts-ignore
                onClick={() => handlePreview(index)}
                fallback={fallUrl}
              />
            ))}
          </Space>
        )}
        {props.preview && (
          <XPreview v-model={[visible.value, 'visible']} current={current.value} urls={previewUrls.value} />
        )}
      </>
    )
  }
})

export default XImage
