<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    :title="title"
    :width="width"
    destroyOnClose
    :spinProps="spinning"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <x-table v-bind="tableOptions">
      <template #resources="{ record: { resources = {} } }">
        <a-button v-if="resources?.fileName" type="link" @click="handleDownload(resources)">
          {{ resources?.fileName }}
        </a-button>
      </template>
    </x-table>
    <a-form :label-col="{ span: 0 }">
      <a-form-item v-bind="validateInfos.remark">
        <a-textarea
          v-model:value="modelRef.remark"
          placeholder="请输入备注"
          showCount
          :rows="4"
          :maxlength="maxlength"
        />
      </a-form-item>
      <a-form-item>
        <x-upload v-model:fileList="modelRef.fileList" :size="size" :limit="limit"></x-upload>
      </a-form-item>
    </a-form>
  </x-modal>
</template>

<script>
import { reactive, computed, toRefs } from 'vue'
import XModal from '@components/Modal'
import XTable from '@components/Table'
import XUpload from '@components/Upload'
import { isFunction } from 'lodash-es'
import { formatTime, isEmpty, download } from '@src/utils'

export default {
  name: 'XRemark',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '备注' },
    width: { type: Number, default: 960 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    customSubmit: { type: Function, require: true },
    maxlength: { type: Number, default: 200 },
    size: { type: Number, default: 3 },
    limit: { type: Number, default: 1 }
  },
  emits: ['update:visible', 'done'],
  components: {
    'x-modal': XModal,
    'x-table': XTable,
    'x-upload': XUpload
  },
  setup(props, { emit }) {
    const modalVisible = computed({
      get: () => {
        if (props.visible) {
          getRemark()
        }
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      confirmLoading: false
    })

    const tableOptions = reactive({
      scroll: {
        y: 400
      },
      border: true,
      size: 'small',
      columns: [
        { title: '备注人', width: 100, dataIndex: 'createdUser' },
        {
          title: '备注时间',
          width: 160,
          dataIndex: 'createdTime',
          customRender: ({ text }) => formatTime(text)
        },
        { title: '备注内容', dataIndex: 'remark' },
        { title: '附件', width: 120, slots: { customRender: 'resources' } }
      ],
      dataSource: [],
      showPagination: false
    })

    const getRemark = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      const res = await customRequest()
      state.spinning = false
      tableOptions.dataSource = res?.data
    }

    const handleDownload = resources => {
      const { url, fileName } = resources || {}
      download(url, fileName)
    }

    const modelRef = reactive({
      remark: '',
      fileList: []
    })

    const rulesRef = reactive({
      remark: [{ required: true, message: '请输入备注' }]
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    const handleOk = async () => {
      const { customSubmit } = props
      if (!isFunction(customSubmit)) return
      validate()
        .then(async () => {
          state.confirmLoading = true
          await customSubmit({
            remark: modelRef.remark,
            ...(!isEmpty(modelRef.fileList) ? { resourcesId: modelRef.fileList[0]?.id } : {})
          })
          state.confirmLoading = false
          modalVisible.value = false
          handleCancel()
          emit('done')
        })
        .catch(err => {
          console.log('error', err)
        })
    }

    const handleCancel = () => {
      resetFields()
    }

    return {
      ...toRefs(state),
      modalVisible,
      tableOptions,
      handleDownload,
      validateInfos,
      modelRef,
      handleOk,
      handleCancel
    }
  }
}
</script>
