import { defineComponent, ref, computed, PropType, watch } from 'vue'
import { Empty, Image, Space } from 'ant-design-vue'
import XPreview from '@components/Preview'
import XPreviewDialog from '@components/PreviewDialog'
import { isObject } from 'lodash-es'
import { compressImage, getStyleSize } from '@src/utils'
import './index.scss'

type FileField = {
  uid?: any
  name?: any
  type?: string
  url?: string
  src?: string
  thumbUrl?: string
  status?: string
}
type PreviewField = string | string[] | { url?: string; src?: string; thumbUrl?: string }[]

const failUrl =
  'data:image/png;base64,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'

const XImage = defineComponent({
  name: 'XImage',
  inheritAttrs: false,
  props: {
    thumbnail: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<string>, default: 'simple' }, // simple/complex
    urls: { type: [String, Array] as PropType<PreviewField>, default: () => [] }, // simple
    previewList: { type: Array as PropType<FileField[]>, default: () => [] }, // complex
    imgZipFile: { type: Object as PropType<FileField> }, // complex
    attachmentZipFile: { type: Object as PropType<FileField> }, // complex
    customRequest: { type: Function as PropType<any> }, // complex
    width: { type: [String, Number] as PropType<number | string> },
    height: { type: [String, Number] as PropType<number | string> },
    preview: { type: Boolean as PropType<boolean>, default: true },
    quality: { type: Number as PropType<number>, default: 1 }
  },
  setup(props, { attrs, expose }) {
    const visible = ref(false)
    const current = ref(0)

    // 缩略图
    const thumbUrls = computed((): string[] => {
      if (props.thumbnail) {
        return [props.thumbnail]
      }

      if (props.mode === 'simple') {
        // 当缩略图没有时，则把urls当成缩略图
        return props.urls
          ? typeof props.urls === 'string'
            ? [props.urls]
            : Array.isArray(props.urls)
            ? props.urls
                .map(item => (isObject(item as PreviewField) ? item?.thumbUrl ?? item?.src ?? item?.url ?? '' : item))
                .filter(Boolean)
            : []
          : []
      }

      if (props.mode === 'complex') {
        // 优先使用customRequest获取预览列表
        if (props.customRequest) {
          return []
        }
        return props.previewList.map(item => item?.thumbUrl ?? item?.src ?? item?.url ?? '').filter(Boolean)
      }

      return []
    })

    // 压缩的图片
    const compressUrls = ref([])
    // 容错的图片
    const originalUrls = computed(() => {
      if (props.mode === 'simple') {
        return previewUrls.value
      }

      if (props.mode === 'complex') {
        // 优先使用customRequest获取预览列表
        if (props.customRequest) {
          return []
        }
        let list = props.previewList.map(item => item?.src ?? item?.url ?? item?.thumbUrl ?? '').filter(Boolean)
        // 如果预览列表为空，则把缩略图当成预览图
        if (!list.length && props.thumbnail) {
          list = [props.thumbnail]
        }
        return list
      }

      return []
    })

    watch(
      thumbUrls,
      () => {
        if (thumbUrls.value.length) {
          // 默认显示失败图片（防止空白）
          compressUrls.value = thumbUrls.value.map(() => failUrl)
          // 压缩图片
          const { width, height, quality } = props
          // 图片质量为0，表示不压缩
          if (quality === 0) return
          Promise.allSettled(thumbUrls.value.map(url => compressImage(url, width, height, quality)))
            .then(res => {
              // @ts-ignore
              compressUrls.value = res.map((v, i) => {
                return v.status === 'fulfilled' ? v.value : originalUrls.value[i]
              })
            })
            .catch(() => {
              compressUrls.value = originalUrls.value
            })
        }
      },
      { immediate: true }
    )

    // 预览图
    const previewUrls = computed((): string[] => {
      // 字符串
      if (typeof props.urls === 'string' && props.urls) {
        return [props.urls]
      }

      // 数组
      const srcs = Array.isArray(props.urls)
        ? props.urls
            .map(item => (isObject(item as PreviewField) ? item?.src ?? item?.url ?? item?.thumbUrl ?? '' : item))
            .filter(Boolean)
        : []

      // 如果预览列表为空，则把缩略图当成预览图
      if (!srcs.length && props.thumbnail) {
        return [props.thumbnail]
      }

      return srcs
    })

    const isPreview = computed(() => {
      // 图片为空时，不支持预览功能
      return (
        props.preview &&
        (props.mode === 'simple' ? previewUrls.value.length > 0 : props.customRequest || props.previewList.length > 0)
      )
    })

    const handlePreview = (index: number) => {
      visible.value = true
      current.value = index
    }

    const { width, height } = getStyleSize({ width: props.width, height: props.height }) as any

    expose({})

    return () => {
      // 图片为空时，显示暂无图片
      if (thumbUrls.value.length === 0) {
        return (
          <div class='x-image__empty' style={{ width: width, height: height }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无图片' />
          </div>
        )
      }

      let renderImage

      if (thumbUrls.value.length === 1) {
        // 单图模式
        renderImage = (
          <Image
            {...attrs}
            style={{ cursor: 'pointer' }}
            width={width}
            height={height}
            src={compressUrls.value[0]}
            preview={false}
            // @ts-ignore
            onClick={() => handlePreview(0)}
            fallback={failUrl}
          />
        )
      }

      if (thumbUrls.value.length > 1) {
        // 相册模式
        renderImage = (
          // antdv 暂不支持wrap={true}属性
          <Space style={{ flexWrap: 'wrap' }}>
            {compressUrls.value.map((src, index) => (
              <Image
                {...attrs}
                key={index}
                style={{ cursor: 'pointer' }}
                width={width}
                height={height}
                src={src}
                preview={false}
                // @ts-ignore
                onClick={() => handlePreview(index)}
                fallback={failUrl}
              />
            ))}
          </Space>
        )
      }

      return (
        <>
          {renderImage}
          {isPreview.value &&
            (props.mode === 'simple' ? (
              <XPreview v-model={[visible.value, 'visible']} current={current.value} urls={previewUrls.value} />
            ) : (
              <XPreviewDialog
                v-model={[visible.value, 'visible']}
                current={current.value}
                previewList={props.previewList}
                imgZipFile={props.imgZipFile}
                attachmentZipFile={props.attachmentZipFile}
                customRequest={props.customRequest}
              />
            ))}
        </>
      )
    }
  }
})

export default XImage
