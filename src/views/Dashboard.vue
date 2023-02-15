<template>
  <div>
    <a-space>
      <a-button @click="handlePreview">预览图片</a-button>
      <a-button @click="handleUploadDialog">上传弹窗</a-button>
      <a-button @click="handlePreviewDialog">预览弹窗</a-button>
      <a-button @click="handleDownload">下载图片</a-button>
    </a-space>
    <XPreview
      v-model:visible="previewState.visible"
      :current="previewState.current"
      :urls="previewState.urls"></XPreview>
    <XUploadDialog v-model:visible="uploadDialogState.visible" :fileList="uploadDialogState.fileList"></XUploadDialog>
    <XPreviewDialog
      v-model:visible="previewDialogState.visible"
      :previewList="previewDialogState.previewList"></XPreviewDialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, onActivated, onMounted, onUnmounted, reactive } from 'vue'
import XPreview from '@components/Preview'
import XUploadDialog from '@components/UploadDialog'
import XPreviewDialog from '@components/PreviewDialog'
import { downloadByUrl } from '@src/utils'
export default defineComponent({
  name: 'Dashboard',
  components: { XPreview, XUploadDialog, XPreviewDialog },
  setup() {
    // 预览图片
    const previewState = reactive({
      visible: false,
      current: 2,
      urls: [
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp'
      ]
    })
    const handlePreview = () => {
      previewState.visible = !previewState.visible
    }

    const baseUrl = 'https://raw.githubusercontent.com/vueComponent/ant-design-vue/main/components/carousel/demo/'
    // 上传弹窗
    const uploadDialogState = reactive({
      visible: false,
      fileList: [1, 2, 3, 4].map(i => {
        return {
          id: i,
          url: `${baseUrl}abstract0${i}.jpg`,
          name: `${i}.jpg`
        }
      })
    })
    const handleUploadDialog = () => {
      uploadDialogState.visible = true
    }

    // 预览弹窗
    const previewDialogState = reactive({
      visible: false,
      previewList: [1, 2, 3, 4].map(i => {
        return {
          id: i,
          url: `${baseUrl}abstract0${i}.jpg`,
          name: `${i}.jpg`
        }
      })
    })
    const handlePreviewDialog = () => {
      previewDialogState.visible = true
    }

    // 下载图片
    const handleDownload = () => {
      downloadByUrl(
        'https://patpatwebstatic.s3.us-west-2.amazonaws.com/origin/product/plm/20221206/4177da2213ae4b56aeb2fa5cd1b6a695.jpg',
        '123.jpg'
      )
    }

    onMounted(() => {
      console.log('onMounted', 'Dashboard组件')
    })
    onActivated(() => {
      console.log('onActivated', 'Dashboard组件')
    })
    onUnmounted(() => {
      console.log('onUnmounted', 'Dashboard组件')
    })
    return {
      previewState,
      handlePreview,
      uploadDialogState,
      handleUploadDialog,
      previewDialogState,
      handlePreviewDialog,
      handleDownload
    }
  }
})
</script>
<style lang="scss" scoped></style>
