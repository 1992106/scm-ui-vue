<template>
  <a-upload
    v-bind="$attrs"
    v-model:file-list="files"
    class="my-upload"
    :accept="accept"
    :list-type="listType"
    :show-upload-list="showUploadList"
    :before-upload="beforeUpload"
    :custom-request="handleCustomRequest"
    @change="handleRemove"
    @preview="handlePreview"
    @download="handleDownload">
    <div v-if="showUploadBtn && (!limit || files.length < limit)">
      <slot>
        <PlusOutlined />
      </slot>
      <span v-show="limit" class="limit">({{ files.length }}/{{ limit }})</span>
    </div>
  </a-upload>
  <x-preview v-model:visible="previewVisible" :urls="previewUrls" :current="previewCurrent"></x-preview>
</template>
<script>
import { defineComponent, reactive, toRefs, watch, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import XPreview from '@components/Preview'
import { isFunction } from 'lodash-es'
import { isEmpty, downloadFile } from '@src/utils'

export default defineComponent({
  name: 'XUpload',
  components: {
    PlusOutlined,
    'x-preview': XPreview
  },
  inheritAttrs: false,
  props: {
    fileList: { type: Array, default: () => [], required: true },
    customRequest: { type: Function },
    listType: { type: String, default: 'picture-card' },
    showUploadBtn: { type: [Boolean, Object], default: true },
    showUploadList: { type: [Boolean, Object], default: true },
    size: { type: Number },
    limit: { type: Number },
    accept: { type: String, default: 'image/*' }
  },
  emits: ['update:fileList', 'change'],
  setup(props, { emit }) {
    const state = reactive({
      files: [],
      // 预览图片
      previewVisible: false,
      previewUrls: [],
      previewCurrent: 0
    })

    const hasImage = () => {
      return ['.png', '.jpg', '.jpeg', '.gif', 'image/'].some(val => props.accept.includes(val))
    }
    const hasDocument = () => {
      return ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.zip', 'application/'].some(val =>
        props.accept.includes(val)
      )
    }
    // 上传前校验
    const beforeUpload = file => {
      // 格式
      let isAccept = true
      if (!isEmpty(props.accept)) {
        const accepts = props.accept.split(',')
        if (hasDocument()) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('application/')
        } else if (hasImage()) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('image/')
        }
      }
      if (!isAccept) {
        message.error(`只能上传${props.accept}格式`)
      }
      // 大小
      let isLtM = true
      if (!isEmpty(props.size)) {
        isLtM = file.size / 1024 / 1024 < props.size
      }
      if (!isLtM) {
        message.error(`不能大于${props.size}M`)
      }
      return isLtM && isAccept
    }

    // 上传图片
    const handleCustomRequest = async options => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      const currentFile = options?.file
      try {
        const { data } = await customRequest(currentFile)
        const file = {
          ...data,
          uid: data?.id,
          name: data?.fileName,
          status: 'done',
          thumbUrl: data?.url || data?.thumbUrl,
          url: data?.url
        }
        const index = state.files.findIndex(val => val?.uid === currentFile?.uid)
        state.files.splice(index, 1, file)
        emit('update:fileList', state.files)
        emit('change', { file, fileList: state.files })
      } catch (e) {
        // 上传失败
        const file = state.files.find(val => val.status === 'uploading')
        file.status = 'error'
        // 延时手动删除上传失败的图片
        setTimeout(() => {
          const index = state.files.find(val => val.status === 'error')
          if (index !== -1) {
            state.files.splice(index, 1)
          }
        }, 1000)
      }
    }

    // 移除图片
    const handleRemove = data => {
      const { file, fileList } = data
      if (file.status === 'removed') {
        state.files = fileList.filter(val => val.status === 'done')
        emit('update:fileList', state.files)
        emit('change', { file, fileList })
      } else if (file.status === undefined) {
        // TODO: 过滤限制上传的图片
        state.files = fileList.filter(val => val?.status !== undefined)
      }
    }

    // 预览图片
    const handlePreview = file => {
      if (props.listType === 'text' && props.showUploadList?.showPreviewIcon === false) {
        return false
      }
      const list = state.files.filter(val => val.status === 'done')
      state.previewCurrent = list.findIndex(v => v.id === file.id)
      state.previewVisible = true
    }

    // 下载图片
    const handleDownload = file => {
      message.info('正在下载中...')
      downloadFile(file.url, file.name)
    }

    watch(
      () => props.fileList,
      fileList => {
        state.files = (fileList || []).map(val => {
          return {
            ...val,
            ...(val?.id
              ? {
                  uid: val?.id,
                  name: val?.fileName,
                  status: 'done',
                  thumbUrl: val?.url || val?.thumbUrl,
                  url: val?.url
                }
              : {})
          }
        })
      },
      { immediate: true, deep: true }
    )

    watchEffect(() => {
      state.previewUrls = state.files.filter(val => val.status === 'done').map(val => val?.url)
    })

    return {
      ...toRefs(state),
      beforeUpload,
      handleCustomRequest,
      handleRemove,
      handlePreview,
      handleDownload
    }
  }
})
</script>
<style lang="scss" scoped>
.my-upload {
  :deep(.ant-upload) {
    position: relative;

    .limit {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
      padding-left: 5px;
      color: #007aff;
      user-select: none;
    }
  }

  :deep(.ant-upload-select-text) .ant-upload {
    display: inline-block;
  }
}
</style>
