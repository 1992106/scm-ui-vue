<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    :title="title"
    :width="width"
    destroy-on-close
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel">
    <x-table v-bind="tableOptions" v-model:pagination="pagination" @search="handleSearch">
      <template #bodyCell="{ column, record: { attachments } }">
        <template v-if="column.key === 'attachments'">
          <a-button v-if="attachments" type="link" @click="handleDownload(attachments)">
            {{ attachments?.fileName }}
          </a-button>
        </template>
      </template>
    </x-table>
    <a-form :label-col="{ span: 0 }">
      <a-form-item v-bind="validateInfos.content">
        <a-textarea
          v-model:value="modelRef.content"
          placeholder="请输入备注"
          show-count
          :rows="4"
          :maxlength="maxlength" />
      </a-form-item>
      <a-form-item>
        <x-upload
          v-model:fileList="modelRef.attachments"
          :customRequest="customUpload"
          :size="size"
          :limit="limit"></x-upload>
      </a-form-item>
    </a-form>
  </x-modal>
</template>

<script lang="ts">
import { reactive, computed, toRefs, defineComponent } from 'vue'
import { Form } from 'ant-design-vue'
import XModal from '@components/Modal'
import XTable from '@components/Table/index.vue'
import XUpload from '@components/Upload/index.vue'
import { isFunction } from 'lodash-es'
import { formatTime, isEmpty, download } from '@src/utils'

export default defineComponent({
  name: 'XRemark',
  components: {
    'x-modal': XModal,
    'x-table': XTable,
    'x-upload': XUpload
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '备注' },
    width: { type: Number, default: 960 },
    height: { type: Number, default: 400 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    customSubmit: { type: Function },
    customUpload: { type: Function },
    maxlength: { type: Number, default: 200 },
    size: { type: Number, default: 3 },
    limit: { type: Number, default: 1 },
    showPagination: { type: Boolean, default: false }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const modalVisible = computed({
      get: () => {
        if (props.visible) {
          handleSearch()
        }
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      confirmLoading: false,
      pagination: {
        page: 1,
        pageSize: 10
      }
    })

    const tableOptions = reactive({
      scroll: {
        y: props.height
      },
      size: 'small',
      columns: [
        {
          title: '备注人',
          width: 100,
          customRender: ({ record }) => {
            return record?.createUser || record?.createdUser
          }
        },
        {
          title: '备注时间',
          width: 160,
          customRender: ({ record }) => {
            const text = record?.createAt || record?.createdTime
            return formatTime(text)
          }
        },
        { title: '备注内容', dataIndex: 'content' },
        { title: '附件', width: 120, key: 'attachments' }
      ],
      dataSource: [],
      showPagination: props.showPagination,
      defaultPaginationConfig: {
        size: 'small',
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '30', '40']
      }
    })

    const handleSearch = async () => {
      const { customRequest, showPagination } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      tableOptions.dataSource = []
      const data = await customRequest({
        ...(showPagination ? state.pagination : {})
      })
      state.spinning = false
      tableOptions.dataSource = (data || []).map(row => {
        const attachments = row?.files || row?.fileList || row?.attachments
        const content = row?.remark || row?.content
        return {
          ...row,
          content,
          attachments
        }
      })
    }

    const handleDownload = row => {
      const { url, fileName } = row || {}
      download(url, fileName)
    }

    const modelRef = reactive({
      content: '',
      attachments: []
    })

    const rulesRef = reactive({
      content: [{ required: true, message: '请输入备注' }]
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    const handleOk = async () => {
      const { customSubmit } = props
      if (!isFunction(customSubmit)) return
      validate()
        .then(async () => {
          state.confirmLoading = true
          await customSubmit({
            content: modelRef.content,
            ...(!isEmpty(modelRef.attachments) ? { resourcesIds: modelRef.attachments.map(val => val?.id) } : {})
          })
          state.confirmLoading = false
          modalVisible.value = false
          handleCancel()
          emit('done')
        })
        .catch(err => {
          console.error(err)
        })
    }

    const handleCancel = () => {
      resetFields()
    }

    return {
      ...toRefs(state),
      modalVisible,
      tableOptions,
      handleSearch,
      handleDownload,
      validateInfos,
      modelRef,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.ant-form {
  margin-top: 20px;

  .ant-form-item {
    margin-bottom: 0;

    &:first-of-type {
      margin-bottom: 10px;
    }
  }

  .my-upload {
    height: 112px;
  }
}
</style>
