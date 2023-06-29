<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-export-excel__dialog"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :confirm-loading="confirmLoading"
    destroy-on-close
    okText="导出"
    @ok="handleOk"
    @cancel="handleCancel">
    <a-form :label-col="{ span: 4 }">
      <a-form-item label="文件名" v-bind="validateInfos['fileName']">
        <a-input v-model:value="modelRef.fileName" placeholder="请输入文件名"></a-input>
      </a-form-item>
      <a-form-item label="工作表名" v-bind="validateInfos['sheetName']">
        <a-input v-model:value="modelRef.sheetName" placeholder="请输入工作表名"></a-input>
      </a-form-item>
      <a-form-item label="导出类型" v-bind="validateInfos['bookType']">
        <a-select v-model:value="modelRef.bookType" :options="bookTypeOptions" placeholder="请选择导出类型"></a-select>
      </a-form-item>
      <a-form-item v-if="columns.length" label="选择字段">
        <a-checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="handleCheckAllChange">
          全选
        </a-checkbox>
        <a-divider />
        <a-checkbox-group v-model:value="checkedList">
          <a-row>
            <a-col v-for="column in columns" :key="column.value" :span="4">
              <a-checkbox :value="column.value">{{ column.label }}</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </a-form-item>
    </a-form>
  </x-modal>
</template>
<script>
import { reactive, toRefs, defineComponent, watchEffect, watch } from 'vue'
import { Checkbox, CheckboxGroup, Col, Divider, Form, FormItem, Input, Row, Select } from 'ant-design-vue'
import XModal from '@src/components/Modal'
import { isFunction } from 'lodash-es'
import { isEmpty, execRequest, formatDate } from '@src/utils'
import { jsonToSheetXlsx } from './utils'
export default defineComponent({
  name: 'XExportExcel',
  components: {
    'x-modal': XModal,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-input': Input,
    'a-select': Select,
    'a-checkbox': Checkbox,
    'a-checkbox-group': CheckboxGroup,
    'a-row': Row,
    'a-col': Col,
    'a-divider': Divider
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '导出数据' },
    width: { type: [String, Number], default: 960 },
    visible: { type: Boolean, default: false },
    columns: { type: Array, default: () => [] },
    dataSource: { type: Array, default: () => [] },
    customRequest: { type: Function },
    fileName: { type: String },
    sheetName: { type: String },
    bookType: { type: String, default: 'xlsx' }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      confirmLoading: false,
      bookTypeOptions: [
        { value: 'xlsx', label: '（*.xlsx）' },
        { value: 'xls', label: '（*.xls）' },
        { value: 'csv', label: '（*.csv）' }
      ],
      data: [],
      indeterminate: false,
      checkAll: false,
      checkedList: props.columns.map(val => val.checked)
    })

    watchEffect(() => {
      // 使用函数方法调用时不会触发
      state.modalVisible = props.visible
    })

    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          state.data = data || []
        },
        fail: () => {}
      })
      state.spinning = false
    }

    watch(
      () => props.visible,
      bool => {
        if (bool) {
          handleRequest()
        }
      },
      { immediate: true }
    )

    // 全选
    const handleCheckAllChange = e => {
      state.indeterminate = false
      state.checkedList = e.target.checked ? props.columns.map(val => val.value) : []
    }

    watch(
      () => state.checkedList,
      val => {
        state.indeterminate = !!val.length && val.length < props.columns.length
        state.checkAll = val.length === props.columns.length
      }
    )

    const modelRef = reactive({
      fileName: props.fileName,
      sheetName: props.sheetName,
      bookType: props.bookType
    })

    const rulesRef = reactive({
      fileName: [{ required: true, message: '请输入文件名' }],
      bookType: [{ required: true, message: '请选择导出类型' }]
    })

    const { resetFields, validate, validateInfos } = Form.useForm(modelRef, rulesRef)

    const handleOk = async () => {
      const { customSubmit } = props
      if (!isFunction(customSubmit)) return
      validate()
        .then(async () => {
          state.confirmLoading = true
          const { columns, dataSource, customRequest } = props
          const data = !isEmpty(customRequest) ? state.data : dataSource
          const header = columns.reduce((o, n) => {
            const { label, value } = n
            if (state.checkedList.includes(value)) {
              o[value] = label
            }
            return o
          }, {})
          const { fileName, sheetName, bookType } = modelRef
          jsonToSheetXlsx({
            data,
            header,
            fileName: `${fileName}$_${formatDate(new Date())}.${bookType}`,
            sheetName,
            write2excelOpts: { bookType }
          })
          emit('done', data)
          // TODO: 使用函数方法调用时，通过emit('update:visible', false)不生效，必须手动关闭
          state.modalVisible = false // 只是为了兼容使用函数方法调用，才需要手动关闭
          handleCancel()
          state.confirmLoading = false
        })
        .catch(err => {
          console.error('remark error', err)
        })
    }

    const handleCancel = () => {
      resetFields()
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
      handleRequest,
      handleCheckAllChange,
      modelRef,
      validateInfos,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-export-excel__dialog {
}
</style>
