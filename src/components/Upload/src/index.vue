<template>
  <a-upload
    v-bind="$attrs"
    v-model:file-list="files"
    class="x-upload"
    :list-type="listType"
    :show-upload-list="showUploadList"
    :accept="accept"
    :max-count="maxCount"
    :before-upload="beforeUploadFn"
    :custom-request="handleCustomRequest"
    @change="handleChange"
    @preview="handlePreview"
    @download="handleDownload"
    @remove="handleRemove">
    <div v-if="mode === 'upload' && (!maxCount || files.length < maxCount)">
      <slot>
        <template v-if="listType === 'picture-card'">
          <PlusOutlined />
        </template>
        <a-button v-else>
          <template #icon><UploadOutlined /></template>
          上传
        </a-button>
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
import { Button, Form, message, Upload } from 'ant-design-vue'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import XPreview from '@components/Preview'
import { isFunction } from 'lodash-es'
import { isEmpty, downloadByUrl, execRequest, getBase64, download } from '@src/utils'
import { formatFile, formatFiles, getBeforeUpload, hasImage } from './utils'
export default defineComponent({
  name: 'XUpload',
  components: {
    PlusOutlined,
    UploadOutlined,
    'a-upload': Upload,
    'x-preview': XPreview,
    'a-button': Button
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
    size: { type: Number },
    minWidth: { type: Number },
    maxWidth: { type: Number },
    minHeight: { type: Number },
    maxHeight: { type: Number },
    maxCount: { type: Number }
  },
  emits: ['update:file-list', 'change', 'preview', 'download', 'remove'],
  setup(props, { emit, slots, expose }) {
    const state = reactive({
      files: [],
      // 预览图片
      previewVisible: false,
      previewCurrent: 0,
      previewUrls: []
    })

    // 上传前校验
    const beforeUploadFn = async file => {
      if (!isEmpty(props.beforeUpload) && isFunction(props.beforeUpload)) {
        return await props.beforeUpload(file)
      }
      return await getBeforeUpload(file, props)
    }

    // 自定义表单校验
    const formItemContext = Form.useInjectFormItemContext()
    // 上传图片
    const handleCustomRequest = async option => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      const { file } = option
      const base64 = await getBase64(file).catch(err => console.error(err))
      await execRequest(customRequest(file), {
        success: ({ data }) => {
          // 上传成功（status: 'done'）
          // 没有触发option.onSuccess()，手动设置状态为 'done'
          const uploadFile = formatFile({ ...data, baseUrl: base64 })
          const index = state.files.findIndex(val => val?.uid === file?.uid)
          if (index !== -1) {
            state.files.splice(index, 1, uploadFile)
            emit('update:file-list', state.files)
            emit('change', { file: uploadFile, fileList: state.files })
            // 自定义表单组件需要手动调用onFieldChange触发校验
            formItemContext.onFieldChange()
          }
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
      //   const base64 = await getBase64(file)
      //   const { data } = await customRequest(file)
      //   // 上传成功（status: 'done'）
      //   // 没有触发option.onSuccess()，手动设置状态为 'done'
      //   const uploadFile = {
      //     ...data,
      //     uid: data?.id || data?.key,
      //     name: data?.name || data?.fileName,
      //     type: data?.type || data?.mimeType,
      //     status: 'done',
      //     thumbUrl: base64 || data?.thumbUrl,
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
        state.files = formatFiles(fileList || [])
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
      // 预览模式：默认显示预览和下载图标，不显示移除图标
      if (props.mode === 'preview' && props.showUploadList === true) {
        return {
          showPreviewIcon: true,
          showDownloadIcon: true,
          showRemoveIcon: false
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
      const previewList = state.files.filter(val => val.status === 'done')
      state.previewUrls = previewList.map(val => val?.url)
      state.previewCurrent = previewList.findIndex(v => v.uid === file.uid)
      state.previewVisible = true
      emit('preview', file)
    }

    // 下载
    const handleDownload = async file => {
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

    // 移除
    const handleRemove = file => {
      emit('remove', file)
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
      handleDownload,
      handleRemove
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
