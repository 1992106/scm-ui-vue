<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-import__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel">
    <slot>
      <div>
        请按照数据模版的格式准备导入数据，模版中的表头名称不可更改及删除。
        <span v-if="limit > 0">每次限制导入 {{ limit }} 行。</span>
        <span v-if="extra" class="color-error">{{ extra }}</span>
      </div>
      <div style="margin-top: 10px">
        <a-button type="link" :loading="downloadLoading" @click="handleDownload">下载导入模版</a-button>
      </div>
      <a-divider orientation="left" orientation-margin="0px" style="margin-top: 10px">将准备好的数据导入</a-divider>
    </slot>
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="导入文件" v-bind="validateInfos['fileList']">
        <template v-if="customUpload">
          <x-upload
            v-model:file-list="modelRef.fileList"
            accept=".csv,.xls,.xlsx"
            list-type="text"
            :maxCount="1"
            :show-upload-list="{ showPreviewIcon: false, showRemoveIcon: true, showDownloadIcon: false }"
            :custom-request="customUpload">
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
          </x-upload>
        </template>
        <template v-else>
          <a-upload
            :file-list="modelRef.fileList"
            accept=".csv,.xls,.xlsx"
            :before-upload="beforeUpload"
            @remove="handleRemove">
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
          </a-upload>
        </template>
      </a-form-item>
      <a-form-item v-if="showInput" label="导入名称" v-bind="validateInfos['name']">
        <a-input v-model:value="modelRef.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item v-if="showTextarea" label="导入备注" v-bind="validateInfos['content']">
        <a-textarea
          v-model:value="modelRef.content"
          placeholder="请输入备注"
          :show-count="true"
          :rows="4"
          :maxlength="maxlength" />
      </a-form-item>
    </a-form>
  </x-modal>
</template>
<script>
import { createVNode, defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { Button, Divider, Form, FormItem, Input, message, Modal, Textarea, Upload } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import XModal from '@src/components/Modal'
import XUpload from '@src/components/Upload'
import { isFunction } from 'lodash-es'
import { download, execRequest, isEmpty } from '@src/utils'
import { readerData } from './utils'
export default defineComponent({
  name: 'XImportExcel',
  components: {
    UploadOutlined,
    'x-modal': XModal,
    'x-upload': XUpload,
    'a-upload': Upload,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-input': Input,
    'a-textarea': Textarea,
    'a-button': Button,
    'a-divider': Divider,
    // eslint-disable-next-line vue/no-unused-components
    Modal
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '导入数据' },
    width: { type: Number, default: 520 },
    visible: { type: Boolean, default: false },
    customSubmit: { type: Function }, // 【前端导入：在前端解析文件，把解析的数据传给后端】
    customImport: { type: Function }, // 【后端导入：1、把上传文件给后端解析；2、先上传文件到s3，再把key传给后端】
    customUpload: { type: Function },
    customDownload: { type: Function },
    customSuccess: { type: Function },
    customError: { type: Function },
    limit: { type: Number, default: 500 },
    extra: { type: String },
    showInput: { type: Boolean, default: false },
    inputRequired: { type: Boolean, default: false },
    showTextarea: { type: Boolean, default: false },
    textareaRequired: { type: Boolean, default: false },
    maxlength: { type: Number, default: 200 }
  },
  emits: ['update:visible', 'success', 'error'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      downloadLoading: false,
      confirmLoading: false
    })

    watchEffect(() => {
      state.modalVisible = props.visible
    })

    // 下载模版
    const handleDownload = async () => {
      const { customDownload } = props
      if (!isFunction(customDownload)) return
      state.downloadLoading = true
      message.info('正在下载中...')
      await execRequest(customDownload(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url || data)
          }
        }
      })
      state.downloadLoading = false
    }

    const beforeUpload = async file => {
      modelRef.fileList = [file]
      return false
    }

    const handleRemove = () => {
      modelRef.fileList = []
    }

    const modelRef = reactive({
      fileList: [],
      name: '',
      content: ''
    })

    const rulesRef = reactive({
      fileList: [{ required: true, type: 'array', message: '请上传文件' }],
      ...(props.showInput ? { name: [{ required: props.inputRequired, message: '请输入名称' }] } : {}),
      ...(props.showTextarea ? { content: [{ required: props.textareaRequired, message: '请输入备注' }] } : {})
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    // 后端导入：2种方案
    // 1、直接把上传的文件给后端，由后端解析
    // 2、先把文件上传到s3，再把s3的key传给后端
    const handleImport = async () => {
      const { customUpload, customImport, showInput, showTextarea, customSuccess, customError } = props
      if (!isFunction(customImport)) return
      const { name, content, fileList } = modelRef
      if (customUpload) {
        // 先把文件上传到s3，再把s3的key传给后端
        const file = fileList.filter(val => val?.status === 'done')?.[0]
        await execRequest(
          customImport({
            ...(!isEmpty(file) ? { id: file?.uid, file } : {}),
            ...(showInput ? { name } : {}),
            ...(showTextarea ? { content } : {})
          }),
          {
            success: result => {
              if (customSuccess) {
                customSuccess(result)
              } else {
                emit('success', result)
                handleCancel()
              }
            },
            fail: error => {
              if (customError) {
                customError(error)
              } else {
                emit('error', error)
              }
            }
          }
        )
      } else {
        // 直接把上传的文件给后端，由后端解析
        const file = fileList?.[0]
        const params = {
          ...(!isEmpty(file) ? { file } : {}),
          ...(showInput ? { name } : {}),
          ...(showTextarea ? { content } : {})
        }
        const formData = new FormData()
        Object.keys(params).forEach(key => {
          formData.append(key, params[key])
        })
        await execRequest(customImport(params), {
          success: result => {
            if (customSuccess) {
              customSuccess(result)
            } else {
              const { data, msg, message } = result || {}
              const tip = data?.msg || data?.message || msg || message
              const total = data?.total ?? data
              Modal.success({
                title: '导入成功',
                content: tip ? tip : total === 0 ? '未导入任何数据' : total > 0 ? `成功导入${total}条数据` : '',
                onOk: () => {
                  emit('success', result)
                  handleCancel()
                }
              })
            }
          },
          fail: error => {
            if (customError) {
              customError(error)
            } else {
              const { data, msg, message } = error || {}
              const tip = data?.msg || data?.message || msg || message
              const url = data?.url || data
              Modal.error({
                title: '导入失败',
                content: () =>
                  createVNode('div', null, [
                    createVNode('p', null, tip || '请删除文件，再重新上传'),
                    url
                      ? createVNode('a', { href: 'javascript:void(0)', onClick: () => download(url) }, '下载失败文件')
                      : null
                  ]),
                onOk: () => {
                  emit('error', error)
                }
              })
            }
          }
        })
      }
    }

    // 前端导入：在前端解析文件，把解析的数据传给后端
    const handleSubmit = async () => {
      const { customSubmit, showInput, showTextarea } = props
      if (!isFunction(customSubmit)) return
      const { name, content, fileList } = modelRef
      const file = fileList?.[0]
      try {
        const { fileName, sheetList } = await readerData(file)
        await execRequest(
          customSubmit({
            fileName,
            ...(sheetList?.[0] || {}),
            ...(showInput ? { name } : {}),
            ...(showTextarea ? { content } : {})
          }),
          {
            success: result => {
              emit('success', result)
              handleCancel()
            },
            fail: error => {
              emit('error', error)
            }
          }
        )
      } catch (error) {
        emit('error', error)
      }
    }

    const handleOk = async () => {
      validate()
        .then(async () => {
          state.confirmLoading = true
          if (props.customImport) {
            await handleImport()
          } else if (props.customSubmit) {
            await handleSubmit()
          }
          state.confirmLoading = false
        })
        .catch(err => {
          console.error('import error', err)
        })
    }

    const handleCancel = () => {
      resetFields()
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      beforeUpload,
      handleRemove,
      modelRef,
      validateInfos,
      handleDownload,
      handleOk,
      handleCancel
    }
  }
})
</script>
