<template>
  <a-upload
    v-bind="$attrs"
    v-model:file-list="files"
    class="x-upload"
    :list-type="listType"
    :show-upload-list="showUploadList"
    :accept="accept"
    :multiple="multiple"
    :max-count="maxCount"
    :before-upload="beforeUploadFn"
    :custom-request="handleCustomRequest"
    @change="handleChange"
    @preview="handlePreview"
    @download="handleDownload">
    <div v-if="mode === 'upload' && (!maxCount || files.length < maxCount)">
      <slot>
        <template v-if="listType === 'picture-card'">
          <PlusOutlined />
        </template>
        <template v-else>
          <a-button>
            <UploadOutlined />
            上传
          </a-button>
        </template>
      </slot>
      <span v-show="maxCount" class="max-count">({{ files.length }}/{{ maxCount }})</span>
    </div>
    <template v-if="hasItemRender" #itemRender="scope">
      <slot name="itemRender" v-bind="scope"></slot>
    </template>
  </a-upload>
  <x-preview v-model:visible="previewVisible" :current="previewCurrent" :urls="previewUrls"></x-preview>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
import { Form, message, Upload } from 'ant-design-vue'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import XPreview from '@components/Preview'
import { isFunction } from 'lodash-es'
import { isEmpty, downloadByUrl, execRequest, getImageSize } from '@src/utils'
export default defineComponent({
  name: 'XUpload',
  components: {
    PlusOutlined,
    UploadOutlined,
    'a-upload': Upload,
    'x-preview': XPreview
  },
  inheritAttrs: false,
  props: {
    fileList: { type: Array, default: () => [], required: true },
    customRequest: { type: Function },
    listType: { type: String, default: 'picture-card' },
    showUploadList: { type: [Boolean, Object], default: true },
    beforeUpload: { type: Function },
    mode: {
      validator(value) {
        return ['upload', 'preview'].includes(value)
      },
      default: 'upload'
    },
    accept: { type: String }, // 'image/*'、'application/*'、'audio/*'、'video/*'、'text/'
    multiple: { type: Boolean },
    size: { type: Number },
    maxWidth: { type: Number },
    maxHeight: { type: Number },
    maxCount: { type: Number }
  },
  emits: ['update:file-list', 'change', 'preview', 'download'],
  setup(props, { emit, slots, expose }) {
    const state = reactive({
      files: [],
      // 预览图片
      previewVisible: false,
      previewUrls: [],
      previewCurrent: 0
    })

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
      if (!isEmpty(props.maxWidth) || !isEmpty(props.maxHeight)) {
        const { width, height } = await getImageSize(file)
        // 宽度
        if (!isEmpty(props.maxWidth)) {
          const isWidth = width <= props.maxWidth
          if (!isWidth) {
            message.error(`宽度不能大于${props.maxWidth}`)
            return false
          }
        }

        // 高度
        if (!isEmpty(props.maxHeight)) {
          const isHeight = height <= props.maxHeight
          if (!isHeight) {
            message.error(`高度不能大于${props.maxHeight}`)
            return false
          }
        }
      }
      return true
    }

    // 自定义校验
    const formItemContext = Form.useInjectFormItemContext()
    // 上传图片
    const handleCustomRequest = async option => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      const { file } = option
      await execRequest(customRequest(file), {
        success: ({ data }) => {
          // 上传成功（status: 'done'）
          // 没有触发option.onSuccess()，手动设置状态为 'done'
          const uploadFile = {
            ...data,
            uid: data?.id || data?.key,
            name: data?.name || data?.fileName,
            type: data?.type || data?.mimeType,
            status: 'done',
            thumbUrl: data?.url || data?.thumbUrl,
            url: data?.url
          }
          const index = state.files.findIndex(val => val?.uid === file?.uid)
          state.files.splice(index, 1, uploadFile)
          emit('update:file-list', state.files)
          emit('change', { file: uploadFile, fileList: state.files })
          // 自定义表单组件需要手动调用onFieldChange触发校验
          formItemContext.onFieldChange()
        },
        fail: () => {
          // 上传失败（status: 'error'）
          // 没有触发option.onError()，手动设置状态为 'error'
          const uploadFile = state.files.find(val => val?.uid === file?.uid)
          uploadFile.status = 'error'
          // 手动删除上传失败的图片
          setTimeout(() => {
            state.files = state.files.filter(val => val?.status === 'done')
          }, 200)
        }
      })
      // try {
      //   const { data } = await customRequest(file)
      //   // 上传成功（status: 'done'）
      //   // 没有触发option.onSuccess()，手动设置状态为 'done'
      //   const uploadFile = {
      //     ...data,
      //     uid: data?.id || data?.key,
      //     name: data?.name || data?.fileName,
      //     type: data?.type || data?.mimeType,
      //     status: 'done',
      //     thumbUrl: data?.url || data?.thumbUrl,
      //     url: data?.url
      //   }
      //   const index = state.files.findIndex(val => val?.uid === file?.uid)
      //   state.files.splice(index, 1, uploadFile)
      //   emit('update:file-list', state.files)
      //   emit('change', { file: uploadFile, fileList: state.files })
      // } catch (e) {
      //   // 上传失败（status: 'error'）
      //   // 没有触发option.onError()，手动设置状态为 'error'
      //   const uploadFile = state.files.find(val => val?.uid === file?.uid)
      //   uploadFile.status = 'error'
      //   // 手动删除上传失败的图片
      //   setTimeout(() => {
      //     state.files = state.files.filter(val => val?.status === 'done')
      //   }, 500)
      // }
    }

    watch(
      () => props.fileList,
      fileList => {
        state.files = (fileList || []).map(val => {
          return {
            ...val,
            ...(val?.id || val?.key
              ? {
                  uid: val?.id || val?.key,
                  name: val?.name || val?.fileName,
                  type: val?.type || val?.mimeType,
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

    // 上传文件改变时的状态（'uploading' 'done' 'error' 'removed'）
    // 因为自定义customRequest方法没有调用onSuccess和onError方法，所以不会触发状态为 'done' 和 'error' 的 change事件
    const handleChange = data => {
      const { file, fileList } = data
      // 移除
      if (file.status === 'removed') {
        state.files = fileList.filter(val => val.status === 'done')
        emit('update:file-list', state.files)
        emit('change', { file, fileList })
        // 自定义表单组件需要手动调用onFieldChange触发校验
        formItemContext.onFieldChange()
      } else if (file.status === undefined) {
        // beforeUpload限制上传的图片status为undefined；故需要过滤限制上传的图片（beforeUpload 里 return false 是阻止默认的 Ajax 上传动作，需要触发 onChange 以便添加到文件列表中交由用户后续手动上传。因此不会阻止文件添加，不会从列表中清空。）
        // multiple为true时，多文件上传，需要异步延迟处理
        setTimeout(() => {
          state.files = fileList.filter(val => val?.status !== undefined)
        }, 20)
      }
    }

    // 是否展示 uploadList
    const showUploadList = computed(() => {
      // 预览模式：只显示预览和下载图标
      if (props.mode === 'preview') {
        return {
          showPreviewIcon: true,
          showDownloadIcon: true
        }
      }
      return props.showUploadList
    })

    // 预览图片
    const handlePreview = file => {
      if (
        props.listType === 'text' &&
        (showUploadList.value === false || showUploadList.value?.showPreviewIcon === false)
      ) {
        return false
      }
      const list = state.files.filter(val => val.status === 'done')
      state.previewUrls = list.map(val => val?.url)
      state.previewCurrent = list.findIndex(v => v.uid === file.uid)
      state.previewVisible = true
      emit('preview', file)
    }

    // 下载
    const handleDownload = file => {
      message.info('正在下载中...')
      downloadByUrl(file.url, file.name)
      emit('download', file)
    }

    // 是否显示插槽
    const hasItemRender = computed(() => !!slots['itemRender'])

    expose({})

    return {
      ...toRefs(state),
      hasItemRender,
      beforeUploadFn,
      handleCustomRequest,
      handleChange,
      showUploadList,
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

    .max-count {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
      padding-left: 5px;
      color: $color-primary;
      user-select: none;
    }
  }

  :deep(.ant-upload-list-picture-card) {
    min-height: 112px;
    // 表格里上传图片鼠标经过的遮罩阴影居中
    .ant-upload-list-item-info::before {
      left: 0;
    }
  }

  :deep(.ant-upload-select-text) .ant-upload {
    display: inline-block;
  }
}
</style>
