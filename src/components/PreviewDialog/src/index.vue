<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-preview__dialog"
    :title="title"
    :width="width"
    :spinning="spinning"
    :footer="null"
    fullscreen
    destroy-on-close
    @cancel="modalVisible = false">
    <div class="x-preview__container">
      <div class="x-preview__carousel">
        <a-carousel
          v-if="files.length"
          ref="elCarousel"
          :initialSlide="current"
          :infinite="false"
          :dots="false"
          :draggable="true">
          <div v-for="(file, i) in files" :key="file?.uid || i">
            <img :src="file?.previewFile?.url || file?.url" :alt="file?.name" />
          </div>
        </a-carousel>
        <div class="x-preview__dots">
          <div class="images" :style="{ height: `${attachmentList.length ? 60 : 100}%` }">
            <div class="head">
              <span class="title">
                图片
                <span>({{ imgList.length }})</span>
              </span>
              <a-button
                type="link"
                size="small"
                :disabled="downloadImgZipFileDisabled"
                @click="handleDownloadImgZipFile">
                下载所有图片
              </a-button>
            </div>
            <div class="dots__list">
              <div v-for="(img, i) in imgList" :key="img?.uid || i" class="dots__list-item" @click="handleGoTo(img)">
                <img :src="img?.thumbUrl || img?.url" :alt="img?.fileName" />
              </div>
            </div>
          </div>
          <template v-if="attachmentList.length">
            <a-divider />
            <div class="attachments">
              <div class="head">
                <span class="title">
                  其他附件
                  <span>({{ attachmentList.length }})</span>
                </span>
                <a-button
                  type="link"
                  size="small"
                  :disabled="downloadAttachmentZipFileDisabled"
                  @click="handleDownloadAttachmentZipFile">
                  下载所有附件
                </a-button>
              </div>
              <div class="dots__list">
                <div
                  v-for="(attachment, i) in attachmentList"
                  :key="attachment.uid || i"
                  class="dots__list-item"
                  @click="handleGoTo(attachment)">
                  <template v-if="attachment?.previewFile">
                    <img
                      :src="attachment.previewFile?.thumbUrl || attachment.previewFile?.url"
                      :alt="attachment.previewFile?.name" />
                  </template>
                  <div v-else class="expanded-name">{{ getFileExpanded(attachment) }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="x-preview__tools">
        <LeftCircleOutlined :class="{ disabled: files.length === 0 || currentSlide === 0 }" @click="handlePrev" />
        <RightCircleOutlined
          :class="{ disabled: files.length === 0 || currentSlide === files.length - 1 }"
          @click="handleNext" />
        <RotateLeftOutlined :class="{ disabled: files.length === 0 }" @click="handleRotateLeft" />
        <RotateRightOutlined :class="{ disabled: files.length === 0 }" @click="handleRotateRight" />
        <ZoomInOutlined :class="{ disabled: files.length === 0 }" @click="handleZoomIn" />
        <ZoomOutOutlined :class="{ disabled: files.length === 0 }" @click="handleZoomOut" />
        <DownloadOutlined :class="{ disabled: files.length === 0 }" @click="handleDownload" />
      </div>
    </div>
  </x-modal>
</template>
<script>
import { computed, defineComponent, reactive, ref, toRefs, watch } from 'vue'
import { Carousel, message } from 'ant-design-vue'
import {
  LeftCircleOutlined,
  RightCircleOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import XModal from '@src/components/Modal'
import { isFunction } from 'lodash-es'
import { formatFiles, getFileExpanded, hasImage } from '@components/UploadDialog/src/utils'
import { download, downloadByUrl, execRequest, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XPreviewDialog',
  components: {
    LeftCircleOutlined,
    RightCircleOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    DownloadOutlined,
    'a-carousel': Carousel,
    'x-modal': XModal
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '预览图片' },
    width: { type: [String, Number], default: 1200 },
    visible: { type: Boolean, default: false },
    current: { type: Number, default: 0 },
    previewList: { type: Array, default: () => [] },
    imgZipFile: { type: Object },
    attachmentZipFile: { type: Object },
    customRequest: { type: Function }
  },
  emits: ['update:visible', 'download', 'downloadImgZipFile', 'downloadAttachmentZipFile'],
  setup(props, { emit, expose }) {
    const elCarousel = ref(null)
    const state = reactive({
      spinning: false,
      files: [],
      // 图片压缩文件
      imgZipFile: null,
      // 附件压缩文件
      attachmentZipFile: null
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
          state.files = formatFiles(data?.previewList || [])
          state.imgZipFile = data?.imgZipFile
          state.attachmentZipFile = data?.attachmentZipFile
        },
        fail: () => {}
      })
      state.spinning = false
    }

    watch(
      () => props.previewList,
      previewList => {
        if (isEmpty(props.customRequest)) {
          state.files = formatFiles(previewList || [])
        }
      },
      { immediate: true, deep: true }
    )

    // 图片
    const imgList = computed(() => {
      return state.files.filter(file => hasImage(file))
    })
    // 其他附件
    const attachmentList = computed(() => {
      return state.files.filter(file => !hasImage(file))
    })

    // 当前图片index
    const currentSlide = computed(() => elCarousel.value?.innerSlider?.currentSlide)

    const handleGoTo = file => {
      // console.log(elCarousel.value.innerSlider)
      const index = state.files.findIndex(val => val?.uid === file?.uid)
      elCarousel.value.goTo(index)
    }

    const handlePrev = () => {
      elCarousel.value.prev()
    }

    const handleNext = () => {
      elCarousel.value.next()
    }

    const handleRotateLeft = () => {}

    const handleRotateRight = () => {}

    const handleZoomIn = () => {}

    const handleZoomOut = () => {}

    // 下载
    const handleDownload = async file => {
      message.info('正在下载中...')
      if (file.url) {
        await downloadByUrl(file.url, file.name)
      }
      emit('download', file)
    }

    // 下载所有图片
    const downloadImgZipFileDisabled = computed(() => isEmpty(state.imgZipFile) || isEmpty(props.imgZipFile))
    const handleDownloadImgZipFile = () => {
      const imgZipFile = state.imgZipFile || props.imgZipFile
      if (imgZipFile?.url) {
        download(imgZipFile.url)
      }
      emit('downloadImgZipFile', imgZipFile)
    }

    // 下载所有附件
    const downloadAttachmentZipFileDisabled = computed(
      () => isEmpty(state.attachmentZipFile) || isEmpty(props.attachmentZipFile)
    )
    const handleDownloadAttachmentZipFile = () => {
      const attachmentZipFile = state.attachmentZipFile || props.attachmentZipFile
      if (attachmentZipFile?.url) {
        download(attachmentZipFile.url)
      }
      emit('downloadAttachmentZipFile', attachmentZipFile)
    }

    expose({})

    return {
      elCarousel,
      ...toRefs(state),
      modalVisible,
      getFileExpanded,
      imgList,
      attachmentList,
      currentSlide,
      handleGoTo,
      handlePrev,
      handleNext,
      handleRotateLeft,
      handleRotateRight,
      handleZoomIn,
      handleZoomOut,
      handleDownload,
      downloadImgZipFileDisabled,
      handleDownloadImgZipFile,
      downloadAttachmentZipFileDisabled,
      handleDownloadAttachmentZipFile
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
        }
      }
      :deep(.slick-slide img) {
        display: block;
        margin: auto;
        width: auto;
        height: 100%;
      }
    }
  }
  .x-preview__carousel {
    flex: 1;
    position: relative;
    padding-right: 200px;
    .x-preview__dots {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 180px;
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .images {
        display: flex;
        flex-direction: column;
      }
      .attachments {
        height: calc(40% - 32px);
        display: flex;
        flex-direction: column;
        .expanded-name {
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
        &-item {
          width: 120px;
          height: 120px;
          margin: 10px 0;
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
