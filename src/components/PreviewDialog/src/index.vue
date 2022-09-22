<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-preview__dialog"
    :title="title"
    :width="width"
    :footer="null"
    destroy-on-close
    @cancel="modalVisible = false">
    <div class="x-preview__container">
      <div class="x-preview__carousel">
        <a-carousel ref="elCarousel" :infinite="false" :initialSlide="current" :dots="false" :adaptiveHeight="true">
          <div v-for="(src, i) in urls" :key="i">
            <img :src="src" alt="" />
          </div>
        </a-carousel>
        <div class="x-preview__dots">
          <div class="images">
            <div class="head">
              <span class="title">
                图片
                <span>({{ imageUrls.length }})</span>
              </span>
              <a>下载所有图片</a>
            </div>
            <div class="list">
              <div v-for="(src, i) in imageUrls" :key="i" class="item" @click="handleGoTo(src)">
                <img :src="src" alt="" />
              </div>
            </div>
          </div>
          <a-divider />
          <div class="attachments">
            <div class="head">
              <span class="title">
                其它附件
                <span>({{ attachmentUrls.length }})</span>
              </span>
              <a>下载所有附件</a>
            </div>
            <div class="list">
              <div v-for="(src, i) in attachmentUrls" :key="i" class="item" @click="handleGoTo(src)">
                <img :src="src" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="x-preview__tools">
        <LeftCircleOutlined @click="handlePrev" />
        <RightCircleOutlined @click="handleNext" />
        <RotateLeftOutlined />
        <RotateRightOutlined />
        <ZoomInOutlined />
        <ZoomOutOutlined />
        <DownloadOutlined @click="handleDownload" />
      </div>
    </div>
  </x-modal>
</template>
<script>
import { computed, defineComponent, ref, watchEffect } from 'vue'
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
import { hasImage } from '@components/UploadDialog/src/utils'
import { downloadByUrl } from '@src/utils'
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
    urls: { type: Array, default: () => [], required: true }
  },
  emits: ['update:visible'],
  setup(props, { emit, expose }) {
    const elCarousel = ref(null)

    const modalVisible = computed({
      get: () => props.visible,
      set: val => {
        emit('update:visible', val)
      }
    })

    const current = ref(props.current)
    watchEffect(() => {
      current.value = props.current
    })

    const urls = ref(props.urls)
    watchEffect(() => {
      urls.value = props.urls
    })

    // 图片
    const imageUrls = computed(() => {
      return props.urls.filter(url => hasImage({ url }))
    })
    // 其它附件
    const attachmentUrls = computed(() => {
      return props.urls.filter(url => !hasImage({ url }))
    })

    const handleGoTo = url => {
      // console.log(elCarousel.value.innerSlider.currentSlide)
      const index = props.urls.findIndex(v => v === url)
      console.log(index, url, props.urls)
      elCarousel.value.goTo(index)
    }

    const handlePrev = () => {
      elCarousel.value.prev()
    }

    const handleNext = () => {
      elCarousel.value.next()
    }

    // 下载
    const handleDownload = file => {
      message.info('正在下载中...')
      downloadByUrl(file.url, file.name)
    }

    expose({})

    return {
      elCarousel,
      current,
      urls,
      modalVisible,
      imageUrls,
      attachmentUrls,
      handleGoTo,
      handlePrev,
      handleNext,
      handleDownload
    }
  }
})
</script>
<style lang="scss" scoped>
.x-preview__dialog {
  .x-preview__container {
    display: flex;
    flex-direction: column;
    // 修改ant-carousel样式
    .ant-carousel {
      :deep(.slick-slider) {
        display: flex;
        align-items: center;
        min-height: 60vh;
      }
      :deep(.slick-slide img) {
        display: block;
        margin: auto;
        max-width: 80%;
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
      width: 160px;
      .head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .images {
        height: 60%;
        display: flex;
        flex-direction: column;
      }
      .attachments {
        height: calc(40% - 32px);
        display: flex;
        flex-direction: column;
      }
      .list {
        flex: 1;
        overflow-x: hidden;
        overflow-y: auto;
        .item {
          width: 120px;
          height: 80px;
          margin: 10px 0;
          cursor: pointer;
          img {
            display: block;
            width: 100%;
            height: 100%;
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
    }
  }
  .ant-divider {
    margin: 16px 0;
  }
}
</style>
