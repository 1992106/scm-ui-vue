<template>
  <a-upload
    v-bind="$attrs"
    v-model:file-list="files"
    class="x-upload"
    :list-type="listType"
    :show-upload-list="showUploadList"
    :accept="accept"
    :max-count="limit"
    :before-upload="beforeUpload"
    :custom-request="handleCustomRequest"
    @change="handleChange"
    @preview="handlePreview"
    @download="handleDownload">
    <div v-if="mode === 'upload' && (!limit || files.length < limit)">
      <slot>
        <PlusOutlined />
      </slot>
      <span v-show="limit" class="limit">({{ files.length }}/{{ limit }})</span>
    </div>
  </a-upload>
  <x-preview v-model:visible="previewVisible" :current="previewCurrent" :urls="previewUrls"></x-preview>
</template>
<script>
import { defineComponent, reactive, toRefs, watch, watchEffect } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import XPreview from '@components/Preview/index.vue'
import { isFunction } from 'lodash-es'
import { isEmpty, downloadByUrl } from '@src/utils'

export default defineComponent({
  name: 'XUpload',
  components: {
    PlusOutlined,
    'x-preview': XPreview,
    'a-upload': Upload
  },
  inheritAttrs: false,
  props: {
    fileList: { type: Array, default: () => [], required: true },
    customRequest: { type: Function },
    listType: { type: String, default: 'picture-card' },
    showUploadList: { type: [Boolean, Object], default: true },
    mode: { type: String, default: 'upload' }, // 'upload'、'preview'
    accept: { type: String }, // 'image/*'、'application/*'、'audio/*'、'video/*'
    size: { type: Number },
    limit: { type: Number }
  },
  emits: ['update:file-list', 'change', 'preview', 'download'],
  setup(props, { emit }) {
    const state = reactive({
      files: [],
      // 预览图片
      previewVisible: false,
      previewUrls: [],
      previewCurrent: 0
    })

    // 上传前校验
    const beforeUpload = file => {
      // 格式
      let isAccept = true
      if (!isEmpty(props.accept)) {
        const accepts = props.accept.split(',')
        if (props.accept.includes('image/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('image/')
        }
        if (props.accept.includes('application/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('application/')
        }
        if (props.accept.includes('audio/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('audio/')
        }
        if (props.accept.includes('video/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || file.type.startsWith('video/')
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

    // 上传图片
    const handleCustomRequest = async options => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      const { file } = options
      try {
        const data = await customRequest(file)
        // 上传成功，status: 'done'
        const uploadFile = {
          ...data,
          uid: data?.id,
          name: data?.fileName,
          status: 'done',
          thumbUrl: data?.url || data?.thumbUrl,
          url: data?.url
        }
        const index = state.files.findIndex(val => val?.uid === file?.uid)
        state.files.splice(index, 1, uploadFile)
        emit('update:file-list', state.files)
        emit('change', { file: uploadFile, fileList: state.files })
      } catch (e) {
        // 上传失败, status: 'error'
        const uploadFile = state.files.find(val => val?.uid === file?.uid)
        uploadFile.status = 'error'
        // 手动删除上传失败的图片
        setTimeout(() => {
          state.files = state.files.filter(val => val?.status === 'done')
        }, 500)
      }
    }

    // 上传文件改变时的状态, 状态：uploading done error removed
    const handleChange = data => {
      const { file, fileList } = data
      if (file.status === 'removed') {
        state.files = fileList.filter(val => val.status === 'done')
        emit('update:file-list', state.files)
        emit('change', { file, fileList })
      } else if (file.status === undefined) {
        // TODO: 过滤限制上传的图片
        state.files = fileList.filter(val => val?.status !== undefined)
      }
    }

    // 预览图片
    watchEffect(() => {
      state.previewUrls = state.files.filter(val => val.status === 'done').map(val => val?.url)
    })
    const handlePreview = file => {
      if (props.listType === 'text' && props.showUploadList?.showPreviewIcon === false) {
        return false
      }
      const list = state.files.filter(val => val.status === 'done')
      state.previewCurrent = list.findIndex(v => v.id === file.id)
      state.previewVisible = true
      emit('preview', file)
    }

    // 下载图片
    const handleDownload = file => {
      message.info('正在下载中...')
      downloadByUrl(file.url, file.name)
      emit('download', file)
    }

    return {
      ...toRefs(state),
      beforeUpload,
      handleCustomRequest,
      handleChange,
      handlePreview,
      handleDownload
    }
  }
})
</script>
<style lang="scss" scoped>
.x-upload {
  :deep(.ant-upload) {
    position: relative;

    .limit {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
      padding-left: 5px;
      color: $color-primary;
      user-select: none;
    }
  }

  :deep(.ant-upload-select-text) .ant-upload {
    display: inline-block;
  }
}
</style>
