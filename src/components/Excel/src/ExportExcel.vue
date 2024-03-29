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
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="文件名" v-bind="validateInfos['fileName']">
        <a-input v-model:value="modelRef.fileName" placeholder="请输入文件名"></a-input>
      </a-form-item>
      <a-form-item label="导出类型" v-bind="validateInfos['bookType']">
        <a-select v-model:value="modelRef.bookType" :options="bookTypeOptions" placeholder="请选择导出类型"></a-select>
      </a-form-item>
      <a-form-item label="工作表名" v-bind="validateInfos['sheetName']">
        <a-input v-model:value="modelRef.sheetName" placeholder="请输入工作表名"></a-input>
      </a-form-item>
      <a-form-item v-if="checkList.length" label="导出字段">
        <div class="box">
          <div class="checkbox-head">
            <a-checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="handleCheckAllChange">
              全选
            </a-checkbox>
          </div>
          <div class="checkbox-body">
            <draggable :list="checkList" item-key="value">
              <template #item="{ element: item }">
                <div class="group">
                  <a-checkbox v-model:checked="item.checked">{{ item.label }}</a-checkbox>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </x-modal>
</template>
<script>
import { reactive, toRefs, defineComponent, watchEffect, watch } from 'vue'
import { Checkbox, Form, FormItem, Input, Select } from 'ant-design-vue'
import XModal from '@src/components/Modal'
import draggable from 'vuedraggable'
import { isFunction } from 'lodash-es'
import { isEmpty, execRequest, formatDate } from '@src/utils'
import { jsonToSheetXlsx } from './utils'
export default defineComponent({
  name: 'XExportExcel',
  components: {
    'x-modal': XModal,
    draggable,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-input': Input,
    'a-select': Select,
    'a-checkbox': Checkbox
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '导出数据' },
    width: { type: [String, Number], default: 520 },
    visible: { type: Boolean, default: false },
    data: { type: Array }, // 【前端导出：通过数据直接导出】 兼容x-table
    dataSource: { type: Array }, // 兼容x-grid组件
    columns: { type: Array, default: () => [] },
    header: { type: Object, default: () => ({}) },
    customRequest: { type: Function }, // 【前端导出：通过接口获取数据导出】
    customExport: { type: Function }, // 【后端导出：把参数传给后端，由直接后端导出】
    fileName: { type: String },
    sheetName: { type: String },
    bookType: { type: String, default: 'xlsx' }
  },
  emits: ['update:visible', 'success', 'error'],
  setup(props, { emit, expose }) {
    const state = reactive({
      modalVisible: props.visible,
      spinning: false,
      confirmLoading: false,
      bookTypeOptions: [
        { value: 'xlsx', label: '*.xlsx' },
        { value: 'xls', label: '*.xls' },
        { value: 'csv', label: '*.csv' }
      ],
      excelData: [],
      indeterminate: false,
      checkAll: false,
      checkList:
        (!isEmpty(props.columns)
          ? props.columns.map(column => ({ ...column, checked: column.checked ?? true }))
          : undefined) ||
        (!isEmpty(props.header)
          ? Object.keys(props.header).map(key => ({ label: props.header[key], value: key, checked: true }))
          : undefined) ||
        []
    })

    watchEffect(() => {
      state.modalVisible = props.visible
    })

    // 通过接口获取数据
    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          state.excelData = data?.list || data || []
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
      state.checkList.forEach(item => {
        item.checked = e.target.checked
      })
    }

    watch(
      () => state.checkList,
      list => {
        state.checkAll = list.length && list.every(val => val.checked)
        state.indeterminate = list.some(val => !val.checked) && !list.every(val => !val.checked)
      },
      { immediate: true, deep: true }
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

    // 后端导出：把参数传给后端，由直接后端导出
    const handlerExport = async () => {
      const { customExport } = props
      if (!isFunction(customExport)) return
      const { fileName, sheetName, bookType } = modelRef
      const checkedList = state.checkList.filter(val => val.checked)
      const columns = checkedList.length ? checkedList : state.checkList // 如果不勾选，默认是导出全部字段
      await execRequest(
        customExport({
          fileName: `${fileName}_${formatDate(new Date())}.${bookType}`,
          sheetName,
          bookType,
          columns
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
    }

    // 前端导出：1、通过接口获取数据导出；2、通过数据直接导出
    const handleXlsx = async () => {
      const { data, dataSource, customRequest } = props
      const excelData = !isEmpty(customRequest) ? state.excelData : data || dataSource || []
      const checkedList = state.checkList.filter(val => val.checked)
      const columns = checkedList.length ? checkedList : state.checkList // 如果不勾选，默认是导出全部字段
      const header = columns.reduce((o, n) => {
        const { label, value } = n
        o[value] = label
        return o
      }, {})
      const { fileName, sheetName, bookType } = modelRef
      try {
        jsonToSheetXlsx({
          data: excelData,
          header,
          fileName: `${fileName}_${formatDate(new Date())}.${bookType}`,
          sheetName,
          write2excelOpts: { bookType }
        })
        emit('success', excelData)
        handleCancel()
      } catch (error) {
        emit('error', error)
      }
    }

    const handleOk = async () => {
      validate()
        .then(async () => {
          state.confirmLoading = true
          if (props.customExport) {
            await handlerExport()
          } else {
            await handleXlsx()
          }
          state.confirmLoading = false
        })
        .catch(err => {
          console.error('export error', err)
        })
    }

    const handleCancel = () => {
      resetFields()
      emit('update:visible', false)
    }

    expose({})

    return {
      ...toRefs(state),
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
  .ant-form-item {
    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .box {
    border: 1px solid $border-color;

    .checkbox-head {
      padding: 6px 12px;
      @include flexRAC;
      border-bottom: 1px solid $border-color-grey;
    }

    .checkbox-body {
      max-height: 320px;
      overflow-y: auto;
      padding: 6px 0;

      .group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 20px;

        &:hover {
          background-color: #1890ff1a;
        }
      }
    }
  }
}
</style>
