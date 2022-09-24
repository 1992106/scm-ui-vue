<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-upload__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel">
    <a-upload-dragger
      v-model:fileList="files"
      :show-upload-list="false"
      :accept="accept"
      :directory="directory"
      :multiple="multiple"
      :max-count="maxCount"
      :before-upload="beforeUploadFn"
      :custom-request="handleCustomUpload"
      @change="handleChange"
      @drop="handleDrop">
      <slot>
        <p class="ant-upload-drag-icon">
          <inbox-outlined />
        </p>
        <p class="ant-upload-text">拖拽图片、文件到这里，或直接点击上传</p>
      </slot>
      <div>
        <p class="ant-upload-hint">每次最多上传{{ maxCount }}个文件，单个文件最大{{ size }}M</p>
        <p v-if="accept" class="ant-upload-hint">支持后缀为：{{ accept }}</p>
      </div>
    </a-upload-dragger>
    <div class="x-upload__container">
      <div class="x-upload__dragger">
        <div class="x-upload__head">
          <span class="title">
            图片
            <span v-show="maxCount" class="max-count">({{ imageList.length }}/{{ maxCount }})</span>
            <span class="subtitle">可手动拖拽调整顺序，默认设置第一张为缩略图</span>
          </span>
          <a>下载所有图片</a>
        </div>
        <div class="x-upload__list">
          <draggable :list="imageList" item-key="uid">
            <template #item="{ element: file }">
              <div class="x-upload__list-item">
                <div class="image">
                  <img :src="file.url" :alt="file.name" />
                  <div class="mark"></div>
                  <div class="operate">
                    <a-button type="text" size="small" @click="handlePreview(file)"><eye-outlined /></a-button>
                    <a-button type="text" size="small" @click="handleDownload(file)"><download-outlined /></a-button>
                    <a-button type="text" size="small" @click="handleRemove(file)"><delete-outlined /></a-button>
                  </div>
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
            <span v-show="maxCount" class="max-count">({{ attachmentList.length }}/{{ maxCount }})</span>
          </span>
          <a>下载所有附件</a>
        </div>
        <div class="x-upload__list">
          <div v-for="(file, index) in attachmentList" :key="file?.uid || index" class="x-upload__list-item">
            <div class="image">
              <img :src="file.url" :alt="file.name" />
              <div class="mark"></div>
              <div class="operate">
                <a-button type="text" size="small" @click="handlePreview(file)"><eye-outlined /></a-button>
                <a-button type="text" size="small" @click="handleDownload(file)"><download-outlined /></a-button>
                <a-button type="text" size="small" @click="handleRemove(file)"><delete-outlined /></a-button>
              </div>
            </div>
            <div class="name">{{ file.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </x-modal>
</template>
<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { message, UploadDragger } from 'ant-design-vue'
import { InboxOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue'
import XModal from '@src/components/Modal'
import draggable from 'vuedraggable'
import { isFunction } from 'lodash-es'
import { isEmpty, execRequest, downloadByUrl } from '@src/utils'
import { hasImage } from './utils'
export default defineComponent({
  name: 'XUploadDialog',
  components: {
    InboxOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EyeOutlined,
    'a-upload-dragger': UploadDragger,
    'x-modal': XModal,
    draggable
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '上传文件' },
    width: { type: [String, Number], default: 720 },
    visible: { type: Boolean, default: false },
    fileList: { type: Array, default: () => [], required: true },
    customRequest: { type: Function, require: true },
    customUpload: { type: Function },
    beforeUpload: { type: Function },
    accept: { type: String }, // 'image/*'、'application/*'、'audio/*'、'video/*'、'text/'
    directory: { type: Boolean },
    multiple: { type: Boolean },
    size: { type: Number, default: 500 },
    maxCount: { type: Number, default: 20 }
  },
  emits: ['change', 'drop', 'preview', 'download', 'remove', 'update:visible', 'done'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      // v-model
      files: [],
      // 图片列表
      imageList: [],
      // 其它附件
      attachmentList: [],
      // 预览图片
      previewVisible: false,
      previewUrls: [],
      previewCurrent: 0
    })

    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest({}), {
        success: ({ data }) => {
          state.files = (data || []).map(val => {
            return {
              ...val,
              ...(val?.id || val?.key
                ? {
                    uid: val?.id || val?.key,
                    name: val?.fileName || val?.name,
                    status: 'done',
                    thumbUrl: val?.url || val?.thumbUrl,
                    url: val?.url
                  }
                : {})
            }
          })
        },
        fail: () => {}
      })
      state.spinning = false
    }

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

    // 上传前校验
    const beforeUploadFn = file => {
      if (props.beforeUpload && isFunction(props.beforeUpload)) {
        return props.beforeUpload(file)
      }
      // 格式
      let isAccept = true
      if (!isEmpty(props.accept)) {
        const accepts = props.accept.split(',')
        if (file.type.startsWith('image/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || props.accept.includes('image/')
        }
        if (file.type.startsWith('application/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || props.accept.includes('application/')
        }
        if (file.type.startsWith('audio/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || props.accept.includes('audio/')
        }
        if (file.type.startsWith('video/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || props.accept.includes('video/')
        }
        if (file.type.startsWith('text/')) {
          isAccept = accepts.some(val => file.type.endsWith(val)) || props.accept.includes('text/')
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
    const handleCustomUpload = async option => {
      const { customUpload } = props
      if (!isFunction(customUpload)) return
      const { file } = option
      await execRequest(customUpload(file), {
        success: ({ data }) => {
          // 上传成功（status: 'done'）
          // 没有触发option.onSuccess()，手动设置状态为 'done'
          const uploadFile = {
            ...data,
            uid: data?.id || data?.key,
            name: data?.fileName || data?.name,
            status: 'done',
            thumbUrl: data?.url || data?.thumbUrl,
            url: data?.url
          }
          const index = state.files.findIndex(val => val?.uid === file?.uid)
          state.files.splice(index, 1, uploadFile)
          emit('change', { file: uploadFile, fileList: state.files })
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
                  name: val?.fileName || val?.name,
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

    watch(
      () => state.files,
      files => {
        state.imageList = files.filter(file => hasImage(file))
        state.attachmentList = files.filter(file => !hasImage(file))
      },
      { immediate: true, deep: true }
    )

    // 上传文件改变时的状态（'uploading' 'done' 'error' 'removed'）
    // 因为自定义customRequest方法没有调用onSuccess和onError方法，所以不会触发状态为 'done' 和 'error' 的 change事件
    // 因为没有使用内部remove方法，所以不会触发状态为 'removed' 的 change事件
    const handleChange = data => {
      const { file, fileList } = data
      if (file.status === undefined) {
        // beforeUpload限制上传的图片status为undefined；故需要过滤限制上传的图片（beforeUpload 里 return false 是阻止默认的 Ajax 上传动作，需要触发 onChange 以便添加到文件列表中交由用户后续手动上传。因此不会阻止文件添加，不会从列表中清空。）
        // multiple为true时，多文件上传，需要异步延迟处理
        setTimeout(() => {
          state.files = fileList.filter(val => val?.status !== undefined)
        }, 20)
      }
    }

    // 当文件被拖入上传区域时执行的回调
    const handleDrop = $event => {
      emit('drop', $event)
    }

    // 预览图片
    const handlePreview = file => {
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

    // 移除
    const handleRemove = file => {
      const list = state.files.filter(val => val.status === 'done')
      const index = list.findIndex(v => v.uid === file.uid)
      state.files.splice(index, 1)
      emit('remove', file)
    }

    const handleOk = () => {
      // emit('done', state.files)
      emit('done', [...state.imageList, ...state.attachmentList])
      handleCancel()
    }

    const handleCancel = () => {
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      beforeUploadFn,
      handleCustomUpload,
      handleChange,
      handleDrop,
      handlePreview,
      handleRemove,
      handleDownload,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-upload__dialog {
  .x-upload__dragger {
    margin-top: 16px;
    .x-upload__head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
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
        float: left;
        margin: 0 8px 8px 0;
        .image {
          width: 104px;
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
      }
    }
  }
  .ant-divider {
    margin: 8px 0 16px 0;
  }
}
</style>
