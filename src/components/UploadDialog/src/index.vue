<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-upload__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    destroy-on-close
    :footer="mode === 'preview' ? null : undefined"
    :okButtonProps="{ disabled: hasUploading }"
    @ok="handleOk"
    @cancel="handleCancel">
    <template v-if="mode === 'upload'">
      <a-upload-dragger
        :show-upload-list="false"
        :accept="accept"
        :directory="directory"
        :multiple="multiple"
        :before-upload="beforeUploadFn"
        :custom-request="handleCustomUpload"
        @drop="handleDrop">
        <slot>
          <p class="ant-upload-drag-icon">
            <inbox-outlined />
          </p>
          <p class="ant-upload-text">拖拽图片、文件到这里，或直接点击上传</p>
        </slot>
        <div>
          <p class="ant-upload-hint">单个文件最大{{ size }}M，最多可上传{{ maxCount }}个文件</p>
          <p v-if="accept" class="ant-upload-hint">支持后缀为：{{ accept }}</p>
        </div>
      </a-upload-dragger>
    </template>
    <div class="x-upload__container">
      <div class="x-upload__dragger">
        <div class="x-upload__head">
          <span class="title">
            图片
            <span class="max-count">({{ imgList.length }})</span>
            <span v-if="mode === 'upload'" class="subtitle">可手动拖拽调整顺序，默认设置第一张为缩略图</span>
          </span>
          <a-button type="link" size="small" :disabled="downloadImgZipFileDisabled" @click="handleDownloadImgZipFile">
            下载所有图片
          </a-button>
        </div>
        <!--图片列表-->
        <div class="x-upload__list">
          <draggable :list="imgList" item-key="uid">
            <template #item="{ element: file }">
              <div class="x-upload__list-item">
                <div class="image">
                  <template v-if="file?.status === 'done'">
                    <img :src="file.url" :alt="file.name" />
                    <div class="mark"></div>
                    <div class="operate">
                      <a-button v-if="showPreviewIcon" type="text" size="small" @click="handlePreview(file)">
                        <template #icon><eye-outlined /></template>
                      </a-button>
                      <a-button v-if="showDownloadIcon" type="text" size="small" @click="handleDownload(file, 'img')">
                        <template #icon><download-outlined /></template>
                      </a-button>
                      <a-button v-if="showRemoveIcon" type="text" size="small" @click="handleRemove(file, 'img')">
                        <template #icon><delete-outlined /></template>
                      </a-button>
                    </div>
                  </template>
                  <div v-if="file?.status === 'uploading'" class="status">上传中...</div>
                </div>
                <!--<div class="name">{{ file.name }}</div>-->
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <a-divider />
      <div class="x-upload__dragger">
        <div class="x-upload__head">
          <span class="title">
            其他附件
            <span class="max-count">({{ attachmentList.length }})</span>
          </span>
          <a-button
            type="link"
            size="small"
            :disabled="downloadAttachmentZipFileDisabled"
            @click="handleDownloadAttachmentZipFile">
            下载所有附件
          </a-button>
        </div>
        <!--附件列表-->
        <div class="x-upload__list">
          <draggable :list="attachmentList" item-key="uid">
            <template #item="{ element: file }">
              <div class="x-upload__list-item">
                <div class="image">
                  <template v-if="file?.status === 'done'">
                    <template v-if="file?.previewFile">
                      <img :src="file.previewFile?.thumbUrl || file.previewFile?.url" :alt="file.previewFile?.name" />
                    </template>
                    <div v-else class="expanded">
                      {{ getFileExpanded(file) }}
                    </div>
                    <div class="mark"></div>
                    <div class="operate">
                      <a-button v-if="showPreviewIcon" type="text" size="small" @click="handlePreview(file)">
                        <template #icon><eye-outlined /></template>
                      </a-button>
                      <a-button
                        v-if="showDownloadIcon"
                        type="text"
                        size="small"
                        @click="handleDownload(file, 'attachment')">
                        <template #icon><download-outlined /></template>
                      </a-button>
                      <a-button
                        v-if="showRemoveIcon"
                        type="text"
                        size="small"
                        @click="handleRemove(file, 'attachment')">
                        <template #icon><delete-outlined /></template>
                      </a-button>
                    </div>
                  </template>
                  <div v-if="file?.status === 'uploading'" class="status">上传中...</div>
                </div>
                <div class="name" :title="file.name">{{ file.name }}</div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </x-modal>
  <x-preview-dialog
    v-model:visible="previewVisible"
    :current="previewCurrent"
    :preview-list="previewList"
    :imgZipFile="imgZipFile"
    :attachmentZipFile="attachmentZipFile"></x-preview-dialog>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, unref, watch } from 'vue'
import { message, UploadDragger } from 'ant-design-vue'
import { InboxOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue'
import XModal from '@components/Modal'
import XPreviewDialog from '@components/PreviewDialog'
import draggable from 'vuedraggable'
import { isFunction } from 'lodash-es'
import { isEmpty, execRequest, downloadByUrl, download, getImageSize } from '@src/utils'
import { formatFiles, getFileExpanded, hasImage } from './utils'
export default defineComponent({
  name: 'XUploadDialog',
  components: {
    InboxOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EyeOutlined,
    'x-modal': XModal,
    'a-upload-dragger': UploadDragger,
    'x-preview-dialog': XPreviewDialog,
    draggable
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '文件上传' },
    width: { type: [String, Number], default: 960 },
    visible: { type: Boolean, default: false },
    fileList: { type: Array, default: () => [] },
    imgZipFile: { type: Object }, // 图片压缩文件
    attachmentZipFile: { type: Object }, // 附件压缩文件
    customRequest: { type: Function },
    customSubmit: { type: Function },
    customUpload: { type: Function },
    showUploadList: { type: [Boolean, Object], default: true },
    beforeUpload: { type: Function },
    mode: {
      validator(value) {
        return ['upload', 'preview'].includes(value)
      },
      default: 'upload'
    },
    accept: { type: String }, // 'image/*'、'application/*'、'audio/*'、'video/*'、'text/'
    directory: { type: Boolean },
    multiple: { type: Boolean },
    size: { type: Number, default: 500 },
    minWidth: { type: Number },
    maxWidth: { type: Number },
    minHeight: { type: Number },
    maxHeight: { type: Number },
    maxCount: { type: Number, default: 40 }
  },
  emits: [
    'update:visible',
    'change',
    'drop',
    'preview',
    'download',
    'remove',
    'done',
    'downloadImgZipFile',
    'downloadAttachmentZipFile'
  ],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      confirmLoading: false,
      // 图片列表
      imgList: [],
      imgZipFile: null,
      // 其他附件
      attachmentList: [],
      attachmentZipFile: null,
      // 预览图片
      previewVisible: false,
      previewCurrent: 0,
      previewList: []
    })

    watch(
      () => props.visible,
      bool => {
        state.modalVisible = bool
        if (bool) {
          handleRequest()
        }
      },
      { immediate: true }
    )

    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          const files = formatFiles(data?.files || data?.fileList || [])
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
      () => props.fileList,
      fileList => {
        if (isEmpty(props.customRequest)) {
          const files = formatFiles(fileList || [])
          state.imgList = files.filter(file => hasImage(file))
          state.attachmentList = files.filter(file => !hasImage(file))
        }
      },
      { immediate: true, deep: true }
    )

    // 文件集合
    const files = computed(() => [...state.imgList, ...state.attachmentList])

    // 上传前校验
    const beforeUploadFn = async file => {
      if (props.beforeUpload && isFunction(props.beforeUpload)) {
        return props.beforeUpload(file)
      }
      // 格式
      if (!isEmpty(props.accept)) {
        let isAccept = true
        const accepts = props.accept.split(',')
        const type = file.type?.split('/').pop()
        const name = file.name?.split('.').pop()
        if (file.type.startsWith('image/')) {
          isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('image/'))
        }
        if (file.type.startsWith('application/')) {
          isAccept = accepts.some(
            accept => accept.includes(name) || accept.includes(type) || accept.includes('application/')
          )
        }
        if (file.type.startsWith('audio/')) {
          isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('audio/'))
        }
        if (file.type.startsWith('video/')) {
          isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('video/'))
        }
        if (file.type.startsWith('text/')) {
          isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('text/'))
        }
        if (!isAccept) {
          message.error(`只能上传${props.accept}格式`)
          return false
        }
      }
      // 大小
      if (!isEmpty(props.size)) {
        let isLtM = file.size / 1024 / 1024 <= props.size
        if (!isLtM) {
          message.error(`不能大于${props.size}M`)
          return false
        }
      }
      // 图片宽高
      if (
        file.type.startsWith('image/') &&
        (!isEmpty(props.minWidth) || !isEmpty(props.maxWidth) || !isEmpty(props.minHeight) || !isEmpty(props.maxHeight))
      ) {
        const { width, height } = await getImageSize(file)
        // 最小宽度
        if (!isEmpty(props.minWidth)) {
          const isMinWidth = width >= props.minWidth
          if (!isMinWidth) {
            message.error(`宽度不能小于${props.minWidth}`)
            return false
          }
        }
        // 最大宽度
        if (!isEmpty(props.maxWidth)) {
          const isMaxWidth = width <= props.maxWidth
          if (!isMaxWidth) {
            message.error(`宽度不能大于${props.maxWidth}`)
            return false
          }
        }
        // 最小高度
        if (!isEmpty(props.minHeight)) {
          const isMinHeight = width >= props.minHeight
          if (!isMinHeight) {
            message.error(`高度不能小于${props.minHeight}`)
            return false
          }
        }
        // 最大高度
        if (!isEmpty(props.maxHeight)) {
          const isMaxHeight = height <= props.maxHeight
          if (!isMaxHeight) {
            message.error(`高度不能大于${props.maxHeight}`)
            return false
          }
        }
      }
      return true
    }

    // 上传文件
    const handleCustomUpload = async option => {
      const { customUpload, maxCount } = props
      if (!isFunction(customUpload)) return
      const { file } = option
      // 限制上传数量
      if (!isEmpty(maxCount) && state.imgList.length >= maxCount && maxCount !== 1) {
        return
      }
      const bool = hasImage(file)
      // 上传中：uploading
      Object.assign(file, { status: 'uploading' })
      if (bool) {
        // 当maxCount=1时，始终用最新上传的代替当前
        if (maxCount === 1) {
          state.imgList.splice(0, 1, file)
        } else {
          state.imgList.push(file)
        }
      } else {
        // 当maxCount=1时，始终用最新上传的代替当前
        if (maxCount === 1) {
          state.attachmentList.splice(0, 1, file)
        } else {
          state.attachmentList.push(file)
        }
      }
      await execRequest(customUpload(file), {
        success: ({ data }) => {
          // 上传成功（status: 'done'），手动设置状态为 'done'
          const uploadFile = {
            ...data,
            uid: data?.id || data?.key,
            name: data?.name || data?.fileName,
            type: data?.type || data?.mimeType,
            status: 'done',
            thumbUrl: data?.url || data?.thumbUrl,
            url: data?.url
          }
          if (bool) {
            const index = state.imgList.findIndex(val => val?.uid === file?.uid)
            if (index !== -1) {
              state.imgList.splice(index, 1, uploadFile)
            }
          } else {
            const index = state.attachmentList.findIndex(val => val?.uid === file?.uid)
            if (index !== -1) {
              state.attachmentList.splice(index, 1, uploadFile)
            }
          }
          emit('change', { file: uploadFile, fileList: [...state.imgList, ...state.attachmentList] })
        },
        fail: () => {
          // 上传失败：error
          Object.assign(file, { status: 'error' })
          if (bool) {
            state.imgList = state.imgList.filter(val => val?.status === 'done')
          } else {
            state.attachmentList = state.attachmentList.filter(val => val?.status === 'done')
          }
        }
      })
    }
    // 是否有上传中的文件
    const hasUploading = computed(() => {
      return [...state.imgList, ...state.attachmentList].some(val => val.status === 'uploading')
    })
    // 当文件被拖入上传区域时执行的回调
    const handleDrop = $event => {
      emit('drop', $event)
    }

    const showPreviewIcon = computed(() => {
      // 预览模式：显示预览图标
      if (props.mode === 'preview') {
        return true
      }
      return props.showUploadList || props.showUploadList?.showPreviewIcon
    })
    const showDownloadIcon = computed(() => {
      // 预览模式：显示下载图标
      if (props.mode === 'preview') {
        return true
      }
      // 默认不显示下载图标
      if (props.showUploadList === true) {
        return false
      }
      return props.showUploadList?.showDownloadIcon
    })
    const showRemoveIcon = computed(() => {
      // 预览模式：不显示移除图标
      if (props.mode === 'preview') {
        return false
      }
      return props.showUploadList || props.showUploadList?.showRemoveIcon
    })

    // 预览图片
    const handlePreview = file => {
      const fileList = unref(files).filter(val => val.status === 'done')
      state.previewList = fileList
      state.previewCurrent = fileList.findIndex(v => v.uid === file.uid)
      state.previewVisible = true
      emit('preview', file)
    }

    // 下载
    const handleDownload = async (file, type) => {
      message.info('正在下载中...')
      if (file.url) {
        if (type === 'img') {
          await downloadByUrl(file.url, file.name)
        } else {
          download(file.url, file.name)
        }
      }
      emit('download', file)
    }

    // 移除
    const handleRemove = (file, type) => {
      if (type === 'img') {
        const index = state.imgList.findIndex(v => v.uid === file.uid)
        state.imgList.splice(index, 1)
      } else {
        const index = state.attachmentList.findIndex(v => v.uid === file.uid)
        state.attachmentList.splice(index, 1)
      }
      emit('change', { file, fileList: [...state.imgList, ...state.attachmentList] })
      emit('remove', file)
    }

    // 下载所有图片
    const downloadImgZipFileDisabled = computed(() => {
      return props.customRequest ? isEmpty(state.imgZipFile) : isEmpty(props.imgZipFile)
    })
    const handleDownloadImgZipFile = () => {
      const imgZipFile = state.imgZipFile || props.imgZipFile
      if (imgZipFile?.url) {
        download(imgZipFile.url)
      }
      emit('downloadImgZipFile', imgZipFile)
    }

    // 下载所有附件
    const downloadAttachmentZipFileDisabled = computed(() => {
      return props.customRequest ? isEmpty(state.attachmentZipFile) : isEmpty(props.attachmentZipFile)
    })
    const handleDownloadAttachmentZipFile = () => {
      const attachmentZipFile = state.attachmentZipFile || props.attachmentZipFile
      if (attachmentZipFile?.url) {
        download(attachmentZipFile.url)
      }
      emit('downloadAttachmentZipFile', attachmentZipFile)
    }

    const handleOk = async () => {
      const { customSubmit } = props
      if (!isFunction(customSubmit)) return
      state.confirmLoading = true
      const fileList = unref(files).filter(val => val.status === 'done')
      await execRequest(
        customSubmit({
          ...(!isEmpty(fileList) ? { ids: fileList.map(val => val?.uid) } : {})
        }),
        {
          success: ({ data }) => {
            emit('done', data)
            handleCancel()
          }
        }
      )
      state.confirmLoading = false
    }

    const handleCancel = () => {
      state.imgZipFile = null
      state.attachmentZipFile = null
      state.previewCurrent = 0
      state.previewList = []
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      beforeUploadFn,
      handleCustomUpload,
      handleDrop,
      hasUploading,
      getFileExpanded,
      showPreviewIcon,
      showRemoveIcon,
      showDownloadIcon,
      handlePreview,
      handleRemove,
      handleDownload,
      downloadImgZipFileDisabled,
      handleDownloadImgZipFile,
      downloadAttachmentZipFileDisabled,
      handleDownloadAttachmentZipFile,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
:deep(.ant-upload.ant-upload-drag) {
  margin-bottom: 16px;
}
.x-upload__dialog {
  .x-upload__dragger {
    .x-upload__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .subtitle {
        color: #999;
        margin-left: 10px;
      }
    }
    .x-upload__list {
      overflow-x: auto;
      overflow-y: hidden;
      min-height: 112px;
      &-item {
        width: 104px;
        float: left;
        margin: 0 8px 8px 0;
        .image {
          height: 104px;
          padding: 8px;
          border: 1px solid #d9d9d9;
          border-radius: 2px;
          position: relative;
          & > img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .status,
          .expanded {
            height: 100%;
            text-align: center;
            line-height: 86px;
            @include ellipsis;
          }
          .mark {
            position: relative;
            height: 100%;
            margin-top: -100%;
            overflow: hidden;
            &:before {
              position: absolute;
              z-index: 1;
              width: 100%;
              height: 100%;
              background-color: #00000080;
              opacity: 0;
              transition: all 0.3s;
              content: ' ';
            }
          }
          .operate {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 10;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: all 0.3s;
            .ant-btn {
              width: 24px;
              height: 20px;
              padding: 0;
              line-height: 1;
              color: #fff;
            }
          }
          &:hover {
            .mark:before,
            .operate {
              opacity: 1;
            }
          }
        }
        .name {
          @include ellipsis;
        }
      }
    }
  }
  .ant-divider {
    margin: 12px 0;
  }
}
</style>
