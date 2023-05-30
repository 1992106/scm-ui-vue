<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-preview__dialog"
    :title="title"
    :width="width"
    :spinProps="spinning"
    :footer="null"
    fullscreen
    destroy-on-close
    @cancel="handleCancel">
    <div class="x-preview__container">
      <div class="x-preview__carousel">
        <a-carousel
          v-if="files.length"
          ref="elCarousel"
          :initialSlide="previewCurrent"
          :infinite="false"
          :dots="false"
          :draggable="true">
          <div v-for="(file, index) in files" :key="file?.uid || index" class="img">
            <img
              :src="file?.previewFile?.url || file?.url"
              :alt="file?.name"
              :style="{
                ...(index === currentSlide ? { transform: `scale3d(${scale}, ${scale}, 1) rotate(${rotate}deg)` } : {})
              }" />
          </div>
        </a-carousel>
        <div class="x-preview__dots">
          <div class="images" :style="{ height: `${hasAttachment ? 60 : 100}%` }">
            <div class="head">
              <span class="title">
                图片
                <span>({{ imgList.length }})</span>
              </span>
              <a-button
                v-if="imgZipFileVisible"
                type="link"
                size="small"
                :disabled="downloadImgZipFileDisabled"
                @click="handleDownloadImgZipFile">
                下载所有图片
              </a-button>
            </div>
            <div class="dots__list">
              <div
                v-for="(img, i) in imgList"
                :key="img?.uid || i"
                class="dots__list-item"
                @click="handleGoTo(img, i, 'img')">
                <img :src="img?.thumbUrl || img?.url" :alt="img?.name" />
              </div>
            </div>
          </div>
          <template v-if="hasAttachment">
            <a-divider />
            <div class="attachments">
              <div class="head">
                <slot name="attachmentTitle">
                  <span class="title">
                    其他附件
                    <span>({{ attachmentList.length }})</span>
                  </span>
                  <a-button
                    v-if="attachmentZipFileVisible"
                    type="link"
                    size="small"
                    :disabled="downloadAttachmentZipFileDisabled"
                    @click="handleDownloadAttachmentZipFile">
                    下载所有附件
                  </a-button>
                </slot>
              </div>
              <div class="dots__list">
                <slot name="attachmentContent">
                  <div
                    v-for="(attachment, i) in attachmentList"
                    :key="attachment.uid || i"
                    class="dots__list-item"
                    @click="handleGoTo(attachment, i, 'attachment')">
                    <template v-if="attachment?.previewFile">
                      <img
                        :src="attachment.previewFile?.thumbUrl || attachment.previewFile?.url"
                        :alt="attachment.previewFile?.name" />
                    </template>
                    <div v-else class="expanded">{{ getFileExpanded(attachment) }}</div>
                  </div>
                </slot>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="x-preview__tools">
        <LeftCircleOutlined :class="{ disabled: files.length === 0 || currentSlide === 0 }" @click="handlePrev" />
        <RightCircleOutlined
          :class="{ disabled: files.length === 0 || currentSlide + 1 === files.length }"
          @click="handleNext" />
        <RotateLeftOutlined :class="{ disabled: files.length === 0 }" @click="handleRotateLeft" />
        <RotateRightOutlined :class="{ disabled: files.length === 0 }" @click="handleRotateRight" />
        <ZoomOutOutlined :class="{ disabled: files.length === 0 || scale === 1 }" @click="handleZoomOut" />
        <ZoomInOutlined :class="{ disabled: files.length === 0 }" @click="handleZoomIn" />
        <DownloadOutlined :class="{ disabled: files.length === 0 }" @click="handleDownload" />
      </div>
    </div>
  </x-modal>
</template>
<script>
import { computed, defineComponent, reactive, ref, toRefs, unref, watch, watchEffect } from 'vue'
import { Button, Carousel, message } from 'ant-design-vue'
import {
  LeftCircleOutlined,
  RightCircleOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomOutOutlined,
  ZoomInOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import XModal from '@src/components/Modal'
import { isFunction } from 'lodash-es'
import { formatFiles, getFileExpanded, hasImage } from '@components/Upload/src/utils'
import { download, downloadByUrl, execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XPreviewDialog',
  components: {
    LeftCircleOutlined,
    RightCircleOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    ZoomOutOutlined,
    ZoomInOutlined,
    DownloadOutlined,
    'x-modal': XModal,
    'a-carousel': Carousel,
    'a-button': Button
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '图片预览' },
    width: { type: [String, Number], default: 1200 },
    visible: { type: Boolean, default: false },
    current: { type: Number, default: 0 },
    previewList: { type: Array, default: () => [] },
    imgZipFile: { type: Object },
    imgZipFileVisible: { type: Boolean, default: true },
    attachmentZipFile: { type: Object },
    attachmentZipFileVisible: { type: Boolean, default: true },
    customRequest: { type: Function }
  },
  emits: ['update:visible', 'download', 'downloadImgZipFile', 'downloadAttachmentZipFile'],
  setup(props, { emit, slots, expose }) {
    const elCarousel = ref(null)
    const state = reactive({
      spinning: false,
      previewCurrent: 0,
      // 图片压缩文件
      imgList: [],
      imgZipFile: null,
      // 附件压缩文件
      attachmentList: [],
      attachmentZipFile: null,
      // 缩放比例
      scale: 1,
      // 旋转度数
      rotate: 0
    })

    const modalVisible = computed({
      get: () => {
        if (props.visible) {
          handleRequest()
        }
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          const files = formatFiles(data?.files || data?.fileList || data?.previewList || [])
          state.imgList = files.filter(file => hasImage(file))
          state.attachmentList = files.filter(file => !hasImage(file))
          state.imgZipFile = data?.imgZipFile
          state.attachmentZipFile = data?.attachmentZipFile
        },
        fail: () => {
          state.imgList = []
          state.attachmentList = []
          state.imgZipFile = null
          state.attachmentZipFile = null
        }
      })
      state.spinning = false
    }

    watch(
      () => props.previewList,
      previewList => {
        if (isEmpty(props.customRequest)) {
          const files = formatFiles(previewList || [])
          state.imgList = files.filter(file => hasImage(file))
          state.attachmentList = files.filter(file => !hasImage(file))
        }
      },
      { immediate: true, deep: true }
    )

    watchEffect(() => {
      state.previewCurrent = props.current
    })

    // 文件集合
    const files = computed(() => [...state.imgList, ...state.attachmentList])
    // 当前图片index
    const currentSlide = computed(() => elCarousel.value?.innerSlider?.currentSlide)

    const handleGoTo = (file, index, type) => {
      if (type === 'attachment') {
        index = index + state.imgList.length
      }
      elCarousel.value.goTo(index)
    }

    // 上一个
    const handlePrev = () => {
      elCarousel.value.prev()
    }

    // 下一个
    const handleNext = () => {
      elCarousel.value.next()
    }

    // 向左旋转
    const handleRotateLeft = () => {
      state.rotate = state.rotate - 90
    }

    // 向右旋转
    const handleRotateRight = () => {
      state.rotate = state.rotate + 90
    }

    // 缩小
    const handleZoomOut = () => {
      if (state.scale > 1) {
        state.scale = state.scale - 1
      }
    }

    // 放大
    const handleZoomIn = () => {
      state.scale = state.scale + 1
    }

    // 下载
    const handleDownload = async () => {
      const file = unref(files)?.[currentSlide.value]
      if (file?.url) {
        message.info('正在下载中...')
        if (hasImage(file)) {
          await downloadByUrl(file.url, file.name)
        } else {
          download(file.url, file.name)
        }
        emit('download', file)
      }
    }

    // 下载所有图片
    const downloadImgZipFileDisabled = computed(() => {
      return props.customRequest ? isEmpty(state.imgZipFile) : isEmpty(props.imgZipFile)
    })
    const handleDownloadImgZipFile = () => {
      const imgZipFile = state.imgZipFile || props.imgZipFile
      if (imgZipFile?.url) {
        message.info('正在下载中...')
        download(imgZipFile.url)
        emit('downloadImgZipFile', imgZipFile)
      }
    }

    // 下载所有附件
    const downloadAttachmentZipFileDisabled = computed(() => {
      return props.customRequest ? isEmpty(state.attachmentZipFile) : isEmpty(props.attachmentZipFile)
    })
    const handleDownloadAttachmentZipFile = () => {
      const attachmentZipFile = state.attachmentZipFile || props.attachmentZipFile
      if (attachmentZipFile?.url) {
        message.info('正在下载中...')
        download(attachmentZipFile.url)
        emit('downloadAttachmentZipFile', attachmentZipFile)
      }
    }

    const handleCancel = () => {
      state.previewCurrent = 0
      state.imgList = []
      state.attachmentList = []
      state.imgZipFile = null
      state.attachmentZipFile = null
      state.scale = 1
      state.rotate = 0
    }

    // 是否显示插槽
    const hasAttachment = computed(
      () => state.attachmentList.length > 0 || !!slots['attachmentTitle'] || !!slots['attachmentContent']
    )

    expose({})

    return {
      elCarousel,
      ...toRefs(state),
      modalVisible,
      hasAttachment,
      getFileExpanded,
      files,
      currentSlide,
      handleGoTo,
      handlePrev,
      handleNext,
      handleRotateLeft,
      handleRotateRight,
      handleZoomOut,
      handleZoomIn,
      handleDownload,
      downloadImgZipFileDisabled,
      handleDownloadImgZipFile,
      downloadAttachmentZipFileDisabled,
      handleDownloadAttachmentZipFile,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-preview__dialog {
  .x-preview__container {
    display: flex;
    flex-direction: column;
    height: 100%;
    // 修改ant-carousel样式
    .ant-carousel {
      height: 100%;
      :deep(.slick-slider) {
        display: flex;
        align-items: center;
        height: 100%;
        .slick-list {
          width: 100%;
          height: 100%;
          .slick-track,
          .slick-slide {
            height: 100%;
            .img,
            & > div {
              height: 100%;
            }
          }
        }
      }
      :deep(.slick-slide img) {
        display: block;
        margin: auto;
        width: auto;
        max-width: 100%;
        height: 100%;
      }
    }
  }
  .x-preview__carousel {
    flex: 1;
    position: relative;
    padding-right: 240px;
    overflow: hidden;
    .x-preview__dots {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 220px;
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }
      .images {
        display: flex;
        flex-direction: column;
      }
      .attachments {
        height: calc(40% - 32px);
        display: flex;
        flex-direction: column;
        .expanded {
          height: 100%;
          text-align: center;
          line-height: 104px;
          @include ellipsis;
        }
      }
      .dots__list {
        flex: 1;
        overflow-x: hidden;
        overflow-y: auto;
        margin-top: 10px;
        &-item {
          width: 100%;
          height: 120px;
          margin-bottom: 10px;
          position: relative;
          cursor: pointer;
          img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          & > :is(div) {
            padding: 8px;
            border-radius: 2px;
            border: 1px solid #d9d9d9;
          }
        }
      }
    }
  }
  .x-preview__tools {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    padding-right: 200px;
    margin-top: 20px;
    font-size: 36px;
    color: #aaa;
    .anticon {
      margin: 0 20px;
      &.disabled {
        cursor: not-allowed;
        color: #ccc;
      }
    }
  }
  .ant-divider {
    margin: 16px 0;
  }
}
</style>
