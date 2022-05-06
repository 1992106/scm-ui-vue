<template>
  <a-config-provider :locale="zhCn">
    <x-modal
      class="x-remark"
      v-bind="$attrs"
      v-model:visible="modalVisible"
      :title="title"
      :width="width"
      destroy-on-close
      :spin-props="spinning"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel">
      <x-table
        v-bind="tableOptions"
        v-model:pagination="pages"
        :rowKey="rowKey"
        :showPagination="showPagination"
        :paginationConfig="paginationConfig"
        @search="handleSearch">
        <template #bodyCell="{ column, record: { attachments } }">
          <template v-if="column.dataIndex === 'attachments'">
            <template v-if="attachments.length">
              <a-button v-for="file in attachments" :key="file?.id" type="link" @click="handleDownload(file)">
                {{ file?.fileName }}
              </a-button>
            </template>
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
            v-model:file-list="modelRef.attachments"
            :customRequest="customUpload"
            :size="size"
            :limit="limit"></x-upload>
        </a-form-item>
      </a-form>
    </x-modal>
  </a-config-provider>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, watchEffect, watch } from 'vue'
import { Button, ConfigProvider, Form, FormItem, Textarea } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
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
    'x-upload': XUpload,
    'a-config-provider': ConfigProvider,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-textarea': Textarea,
    'a-button': Button
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '备注' },
    width: { type: [String, Number], default: 960 },
    rowKey: { type: [String, Function], default: 'id' },
    scrollY: { type: [String, Number], default: 360 },
    maxlength: { type: Number, default: 200 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    customSubmit: { type: Function },
    customUpload: { type: Function },
    size: { type: Number, default: 3 },
    limit: { type: Number, default: 1 },
    showPagination: { type: Boolean, default: false },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 10 }) },
    paginationConfig: {
      type: Object,
      default: () => ({
        size: 'small',
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '30', '40']
      })
    }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      confirmLoading: false,
      pages: props.pagination
    })

    watchEffect(() => {
      state.modalVisible = props.visible
      state.pages = props.pagination
    })

    const tableOptions = reactive({
      scroll: {
        y: props.scrollY
      },
      rowKey: props.rowKey,
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
            const text = record?.createAt || record?.createdAt || record?.createTime || record?.createdTime
            return formatTime(text)
          }
        },
        { title: '备注内容', minWidth: 200, dataIndex: 'content' },
        { title: '附件', minWidth: 120, dataIndex: 'attachments' }
      ],
      dataSource: [],
      total: 0
    })

    const handleSearch = async () => {
      const { customRequest, showPagination } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      tableOptions.dataSource = []
      const data = await customRequest({
        ...(showPagination ? state.pages : {})
      })
      state.spinning = false
      if (showPagination) {
        const list = data?.data ?? data?.list ?? []
        tableOptions.dataSource = list.map(row => {
          const attachments = row?.files || row?.fileList || row?.attachments
          const content = row?.remark || row?.content
          return {
            ...row,
            content,
            attachments: !isEmpty(attachments) ? attachments : []
          }
        })
        tableOptions.total = data?.total || 0
      } else {
        tableOptions.dataSource = (data || []).map(row => {
          const attachments = row?.files || row?.fileList || row?.attachments
          const content = row?.remark || row?.content
          return {
            ...row,
            content,
            attachments: !isEmpty(attachments) ? attachments : []
          }
        })
        tableOptions.total = (data || []).length
      }
    }

    watch(
      () => props.visible,
      bool => {
        if (bool) {
          handleSearch()
        }
      },
      { immediate: true }
    )

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

    const handleCancel = () => {
      resetFields()
      state.modalVisible = false // 使用函数方法调用时，需要手动关闭
      emit('update:visible', false)
    }

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
          handleCancel()
          emit('done')
        })
        .catch(err => {
          console.error(err)
        })
    }

    return {
      zhCn,
      ...toRefs(state),
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
.x-remark {
  .ant-form {
    margin-top: 20px;

    .ant-form-item {
      margin-bottom: 10px;

      &:last-of-type {
        height: 112px;
        margin-bottom: 0;
      }
    }
  }
}
</style>
