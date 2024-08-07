<template>
  <div class="x-search">
    <div v-if="hasTop" class="search-top">
      <slot name="top"></slot>
    </div>
    <a-form
      v-if="getColumns.length"
      ref="xForm"
      v-bind="$attrs"
      :layout="layout"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :style="formStyle">
      <a-row v-bind="rowProps">
        <template v-for="(column, index) in getColumns" :key="column?.field">
          <a-col
            v-show="canExpand || index < getIndex"
            v-bind="{ ...colProps, ...(column?.colProps ? column.colProps : {}) }">
            <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
              <slot name="formItemRender" :record="modelRef" :column="column" :index="index">
                <component
                  :is="column.type"
                  v-bind="column?.props || {}"
                  v-model:[column.modelValue]="modelRef[column.field]"
                  v-on="column?.events || {}"></component>
              </slot>
            </a-form-item>
          </a-col>
        </template>
        <a-col class="actions" v-bind="colProps" style="margin-left: auto">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
            <a-space>
              <template v-if="showSearch">
                <a-button type="primary" :disabled="searchDisabled" @click.prevent="handleSearch">
                  {{ searchText }}
                </a-button>
              </template>
              <template v-if="showReset">
                <a-button :disabled="resetDisabled" @click.prevent="handleReset">{{ resetText }}</a-button>
              </template>
              <div v-if="hasShowExpand" class="expand" @click="handleExpand">
                <template v-if="canExpand">
                  <span>收起</span>
                  <UpOutlined />
                </template>
                <template v-else>
                  <span>展开</span>
                  <DownOutlined />
                </template>
              </div>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div v-if="hasBottom" class="search-bottom">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, mergeProps, nextTick, reactive, ref, toRaw, unref } from 'vue'
import { Form } from 'ant-design-vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { omit, pick } from 'lodash-es'
import { isEmpty, triggerResize } from '@src/utils'
import { mergeEvents, cleanDisabled } from './utils'
import {
  formatDefaultDate,
  formatFormModel,
  formatFormRules,
  formatFormValues,
  getModelValue,
  hasDate
} from '@components/Form/src/utils'
export default defineComponent({
  name: 'XSearch',
  components: {
    DownOutlined,
    UpOutlined
  },
  inheritAttrs: false,
  props: {
    // 表单自定义字段
    columns: { type: Array, required: true, default: () => [] },
    // 表单布局
    layout: {
      validator(value) {
        return ['horizontal', 'vertical', 'inline'].includes(value)
      },
      default: 'horizontal'
    },
    // 标签布局
    labelCol: { type: Object, default: () => ({ span: 9 }) },
    // 控件布局
    wrapperCol: { type: Object, default: () => ({ span: 15 }) },
    // row
    rowProps: { type: Object, default: () => ({ gutter: 24 }) },
    // col
    colProps: { type: Object, default: () => ({ span: 6 }) },
    // 重置时是否触发搜索
    resetSearch: { type: Boolean, default: true },
    // 清空时是否触发搜索
    clearSearch: { type: Boolean, default: false },
    // 按钮
    showSearch: { type: Boolean, default: true },
    searchText: { type: String, default: '搜索' },
    searchDisabled: { type: Boolean, default: false },
    showReset: { type: Boolean, default: true },
    resetText: { type: String, default: '重置' },
    resetDisabled: { type: Boolean, default: false },
    // 是否显示【展开/收起】按钮
    showExpand: { type: Boolean, default: true },
    // 默认收起
    defaultExpand: { type: Boolean, default: false }
  },
  emits: ['search', 'reset', 'clear'],
  setup(props, { emit, slots, expose }) {
    const xForm = ref(null)

    // 默认值
    const defaultState = {
      AInput: {
        props: {
          allowClear: true
        },
        events: ['change', 'pressEnter']
      },
      ATextarea: {
        props: {
          allowClear: true
        },
        events: ['change', 'pressEnter']
      },
      AInputNumber: {
        events: ['pressEnter']
      },
      AAutoComplete: {
        props: {
          allowClear: true
        },
        events: ['change']
      },
      ASelect: {
        props: {
          allowClear: true,
          showSearch: true,
          optionFilterProp: 'label'
        },
        events: ['clear']
      },
      ATreeSelect: {
        props: {
          allowClear: true,
          showSearch: true,
          treeCheckable: true
        },
        events: ['change']
      },
      ACascader: {
        props: {
          allowClear: true,
          showSearch: true,
          placeholder: ''
        },
        events: ['change']
      },
      ATimePicker: {
        props: {
          allowClear: true
        },
        events: ['change']
      },
      ADatePicker: {
        props: {
          picker: 'date',
          allowClear: true,
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD'
        },
        events: ['change']
      },
      ARangePicker: {
        props: {
          picker: 'date',
          allowClear: true,
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD'
        },
        events: ['change']
      }
    }
    // 默认事件映射
    const defaultEventsMap = {
      // 实现清除事件
      change: $event => {
        // Input或Cascader/DatePicker/TreeSelect组件不支持clear事件，使用change模拟clear事件
        if (($event?.type === 'click' && !$event.target.value) || isEmpty($event)) {
          emit('clear', emitData())
        }
      },
      clear: () => {
        // Select
        nextTick(handleClear)
      },
      // 实现enter搜索功能
      pressEnter: () => {
        // Input/InputNumber/Textarea组件
        emitSearch()
      }
    }
    // 获取格式化后的columns
    const getColumns = computed(() => {
      return props.columns.map(column => {
        const { props = {}, events = {} } = cleanDisabled(column) // disabled: true => false
        const defaultAllState = defaultState[column?.type] || {}
        // column
        const columnKeys = ['type', 'title', 'field', 'rules', 'children', 'colProps']
        const allColumn = pick(column, columnKeys)
        // props
        const defaultProps = defaultAllState.props || {}
        const otherProps = omit(column, [...columnKeys, 'props', 'events'])
        const allProps = mergeProps(defaultProps, otherProps, props)
        // 格式化时间
        if (hasDate(column)) {
          formatDefaultDate(allProps)
        }
        // events
        const defaultEvents = defaultAllState.events || []
        const allEvents = mergeEvents(defaultEventsMap, defaultEvents, events)

        return { ...allColumn, modelValue: getModelValue(column?.type), props: allProps, events: allEvents }
      })
    })

    const modelRef = reactive({})
    const rulesRef = reactive({})

    const { validate, resetFields, validateInfos } = Form.useForm(
      Object.assign(modelRef, formatFormModel(unref(getColumns))),
      Object.assign(rulesRef, formatFormRules(unref(getColumns)))
    )

    const emitData = () => {
      return toRaw(formatFormValues(unref(getColumns), modelRef))
    }

    const emitSearch = () => {
      emit('search', emitData())
    }

    const handleSearch = () => {
      validate()
        .then(() => {
          emitSearch()
        })
        .catch(err => {
          console.error('search error', err)
        })
    }

    const handleReset = bool => {
      resetFields()
      emit('reset', emitData())
      // 是否触发搜索
      // 1、通过ref调用重置方法时，默认不搜索
      // 2、点击重置按钮时，默认会触发搜索
      if (bool !== false && props.resetSearch) {
        emitSearch()
      }
    }

    const handleClear = () => {
      emit('clear', emitData())
      if (props.clearSearch) {
        emitSearch()
      }
    }

    // 表单样式
    const formStyle = computed(() => {
      return props.labelCol?.span ? { 'margin-right': '20px' } : { margin: '0 20px' }
    })

    /**
     * 是否显示【展开收起】按钮
     * @type {ComputedRef<unknown>}
     */
    const hasShowExpand = computed(() => {
      if (props.showExpand && props.colProps?.span) {
        // 判断是否多行，如果只有一行，则不需要【展开/收起】按钮
        const max = 24 / props.colProps.span
        return props.columns.length > max - 1
      } else {
        return false
      }
    })

    const getIndex = computed(() => {
      if (props.showExpand && props.colProps?.span) {
        return 24 / props.colProps.span - 1
      } else {
        return getColumns.value.length
      }
    })

    // 是否展开/收起
    const canExpand = ref(props.defaultExpand)
    const handleExpand = () => {
      canExpand.value = !canExpand.value
      // 触发表格计算
      nextTick(triggerResize)
    }

    // 是否显示插槽
    const hasTop = computed(() => !!slots['top'])
    const hasBottom = computed(() => !!slots['bottom'])

    // 搜索方法
    const onSearch = () => {
      // TODO: 调用onSetFieldValue时，需要延迟调用handleSearch
      return nextTick().then(handleSearch)
    }

    // 重置方法
    const onReset = (bool = false) => {
      // 默认不触发搜索方法
      handleReset(bool)
    }

    // 获取搜索参数
    const onGetFormValues = () => {
      return emitData()
    }

    // 设置搜索字段和值
    const onSetFieldValue = obj => {
      if (!isEmpty(obj)) {
        Object.keys(obj).forEach(field => {
          Object.assign(modelRef, { [field]: obj[field] })
        })
      }
    }

    expose({
      xForm,
      onSearch,
      onReset,
      onSetFieldValue,
      onGetFormValues
    })

    return {
      xForm,
      hasTop,
      hasBottom,
      getColumns,
      modelRef,
      validateInfos,
      handleSearch,
      handleReset,
      handleClear,
      formStyle,
      hasShowExpand,
      getIndex,
      canExpand,
      handleExpand
    }
  }
})
</script>
<style lang="scss" scoped>
.x-search {
  background-color: #fff;
  border-radius: 2px;

  .search-top {
    //padding: 0 10px;
  }

  .search-bottom {
    padding: 10px;
    border-top: 1px #d9d9d9 dashed;
  }

  .ant-form {
    padding-top: 10px;

    :deep(.ant-form-item) {
      margin-bottom: 10px;
    }

    :deep(.actions) {
      text-align: right;

      .expand {
        cursor: pointer;
        min-width: 50px;
      }
    }

    // 水平布局/垂直布局
    &.ant-form-horizontal,
    &.ant-form-vertical {
      :deep(.ant-form-item) {
        .ant-form-item-control-input-content {
          .ant-input-number,
          .ant-input-number-group-wrapper,
          .ant-picker {
            width: 100%;
          }
        }
      }
    }

    // 行内布局
    &.ant-form-inline {
      :deep(.ant-row) {
        flex: 1;
      }
    }
  }
}
</style>
