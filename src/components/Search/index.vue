<template>
  <div :class="['my-search', showExpand ? 'show-expand' : '']">
    <div v-if="hasExtra" class="extra">
      <slot name="extra"></slot>
    </div>
    <a-form ref="xForm" v-bind="$attrs" :layout="layout" :label-col="labelCol" :wrapper-col="wrapperCol">
      <template v-for="column in getColumns" :key="column.field || column.slot">
        <template v-if="column.type">
          <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
            <component
              :is="column.type"
              v-model:[column.modelValue]="modelRef[column.field]"
              v-bind="column.props || {}"
              v-on="column.events || {}"></component>
          </a-form-item>
        </template>
        <!--自定义slot-->
        <template v-else>
          <a-form-item :label="column?.title">
            <slot :name="column.slot"></slot>
          </a-form-item>
        </template>
      </template>
      <div class="actions">
        <a-space>
          <template v-if="showSearch">
            <a-button type="primary" @click.prevent="handleSearch">{{ searchText }}</a-button>
          </template>
          <template v-if="showReset">
            <a-button @click="handleReset">{{ resetText }}</a-button>
          </template>
          <div v-if="isShowExpand" class="expand" @click="handleExpand">
            <template v-if="isExpand">
              <span>收起</span>
              <UpOutlined />
            </template>
            <template v-else>
              <span>展开</span>
              <DownOutlined />
            </template>
          </div>
        </a-space>
      </div>
    </a-form>
    <div v-if="hasShortcut" class="shortcut">
      <slot name="shortcut"></slot>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, mergeProps, nextTick, onMounted, reactive, ref, toRaw, unref } from 'vue'
import { Form } from 'ant-design-vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { omit, pick } from 'lodash-es'
import { useFormLayout } from './useFormLayout'
import { toDisabled, mergeEvents, toEmpty } from './utils'
import { dateToDayjs, dayjsToDate, isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XSearch',
  components: {
    DownOutlined,
    UpOutlined
  },
  inheritAttrs: false,
  props: {
    // 自定义字段
    columns: { type: Array, required: true, default: () => [] },
    // 重置搜索
    resetSearch: { type: Boolean, default: true },
    // 清空搜索
    clearSearch: { type: Boolean, default: false },
    // 表单布局
    layout: {
      validator(value) {
        return ['horizontal', 'vertical', 'inline'].includes(value)
      },
      default: 'inline'
    },
    // 标签布局
    labelCol: { type: Object, default: () => ({}) },
    // 控件布局
    wrapperCol: { type: Object, default: () => ({}) },
    scrollToFirstError: { type: Boolean, default: true },
    // 按钮
    showSearch: { type: Boolean, default: true },
    searchText: { type: String, default: '搜索' },
    showReset: { type: Boolean, default: true },
    resetText: { type: String, default: '重置' },
    showExpand: { type: Boolean, default: false },
    defaultExpand: { type: Boolean, default: false }
  },
  emits: ['search', 'reset', 'clear'],
  setup(props, { emit, slots }) {
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
          treeCheckable: true,
          maxTagCount: 1
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
          allowClear: true,
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD'
        },
        events: ['change']
      },
      ARangePicker: {
        props: {
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
        // Input或Cascader/DatePicker/TreeSelect组件不支持clear，使用change模拟clear事件
        if (($event?.type === 'click' && !$event.target.value) || isEmpty($event)) {
          emit('clear', emitData())
        }
      },
      clear: () => {
        // Select
        nextTick(() => {
          handleClear()
        })
      },
      // 实现enter搜索功能
      pressEnter: () => {
        // Input/InputNumber组件
        onEmit()
      }
    }
    // 获取v-model绑定名称
    const getModelValue = type => (['ASwitch'].includes(type) ? 'checked' : 'value')
    // 获取格式化后的columns
    const getColumns = computed(() => {
      return props.columns.map(column => {
        const { props = {}, events = {} } = toDisabled(column)
        const defaultAllState = defaultState[column?.type] || {}
        // column
        const allColumn = pick(column, ['type', 'title', 'field', 'slot', 'rules'])
        // props
        const defaultProps = defaultAllState.props || {}
        const otherProps = omit(column, ['type', 'title', 'field', 'slot', 'rules', 'props', 'events'])
        const allProps = toRaw(mergeProps(defaultProps, otherProps, props))
        // events
        const defaultEvents = defaultAllState.events || []
        const allEvents = mergeEvents(defaultEventsMap, defaultEvents, events)
        return { ...allColumn, modelValue: getModelValue(column?.type), props: allProps, events: allEvents }
      })
    })
    // 是否是多选框
    const hasMultiple = column => {
      return (
        (column?.type === 'ASelect' && ['multiple', 'tags'].includes(column?.props?.mode)) ||
        (column?.type === 'ASlider' && column?.props?.range) ||
        (column?.type === 'ATreeSelect' && column?.props?.multiple) ||
        ['ACheckboxGroup', 'ACascader', 'ARangePicker'].includes(column?.type)
      )
    }
    // 是否是日期选择框
    const hasDate = column => {
      return ['ADatePicker', 'AWeekPicker', 'AMonthPicker', 'ARangePicker', 'ATimePicker'].includes(column?.type)
    }

    const allDefaultValue = ['defaultValue', 'defaultPickerValue']
    const getModel = computed(() => {
      return unref(getColumns).reduce((prev, next) => {
        // 在使用useForm时，需要手动设置默认值
        let value = allDefaultValue.map(val => next?.props[val]).find(Boolean)
        // 格式化时间（antd不支持new Date()）
        if (hasDate(next)) {
          value = dateToDayjs(value, next?.props?.valueFormat)
        }
        if (isEmpty(value)) {
          value = hasMultiple(next) ? [] : undefined
        }
        // TODO: AAutoComplete组件默认值为undefined时，点击重置无效
        if (next.type === 'AAutoComplete') {
          value = ''
        }
        prev[next.field] = isEmpty(modelRef) ? value : modelRef[next.field]
        return prev
      }, {})
    })
    const getRules = computed(() => {
      return unref(getColumns).reduce((prev, next) => {
        if (!isEmpty(next?.rules)) {
          prev[next.field] = next?.rules
        }
        return prev
      }, {})
    })

    const modelRef = reactive({})
    const rulesRef = reactive({})
    const { validate, resetFields, validateInfos } = Form.useForm(
      Object.assign(modelRef, unref(getModel)),
      Object.assign(rulesRef, unref(getRules))
    )

    const emitData = () => {
      const params = unref(getColumns).reduce((prev, column) => {
        const value = modelRef[column.field]
        prev[column.field] = hasDate(column) ? dayjsToDate(value, column?.props?.valueFormat) : value
        return prev
      }, {})
      return toEmpty(params)
    }

    const handleSearch = () => {
      validate()
        .then(() => {
          onEmit()
        })
        .catch(err => {
          console.log('from error', err)
        })
    }

    const onEmit = () => {
      emit('search', emitData())
    }

    const handleReset = () => {
      resetFields()
      emit('reset', emitData())
      if (props.resetSearch) {
        onEmit()
      }
    }

    const handleClear = () => {
      emit('clear', emitData())
      if (props.clearSearch) {
        onEmit()
      }
    }

    // 表单布局
    const { updateLayout, hasExpand } = useFormLayout()
    const isExpand = ref(props.defaultExpand)
    const handleExpand = () => {
      isExpand.value = !isExpand.value
      updateLayout()
    }

    const isShowExpand = ref(false)
    onMounted(() => {
      if (props.showExpand === true) {
        isShowExpand.value = hasExpand()
      }
      // 默认收起
      nextTick(() => {
        if (props.defaultExpand === false && props.showExpand === true) {
          updateLayout()
        }
      })
    })

    // 是否显示插槽
    const hasExtra = computed(() => !!slots['extra'])
    const hasShortcut = computed(() => !!slots['shortcut'])

    // 搜索方法
    const onSearch = () => {
      nextTick(() => {
        handleSearch()
      })
    }

    // 重置方法
    const onReset = () => {
      nextTick(() => {
        handleReset()
      })
    }

    // 设置字段和值
    const onSetFieldValue = obj => {
      if (!isEmpty(obj)) {
        Object.keys(obj).forEach(field => {
          Object.assign(modelRef, { [field]: obj[field] })
        })
      }
    }

    return {
      xForm,
      hasExtra,
      hasShortcut,
      getModelValue,
      getColumns,
      modelRef,
      validateInfos,
      handleSearch,
      handleReset,
      handleClear,
      onSearch,
      onReset,
      onSetFieldValue,
      isExpand,
      isShowExpand,
      handleExpand
    }
  }
})
</script>
<style lang="less" scoped>
.my-search {
  background-color: #fff;
  border-radius: 2px;
  padding: 10px 0;
  margin-bottom: 10px;

  .ant-form {
    .ant-form-item {
      line-height: 40px;
    }

    .actions {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      line-height: 40px;

      :deep(.expand) {
        cursor: pointer;
        min-width: 50px;
      }
    }
  }

  .extra {
    margin: 0 10px 6px 10px;
  }

  .shortcut {
    margin: 6px 10px 0 10px;
  }

  // 展开收起
  &.show-expand {
    .ant-form {
      // 显示、隐藏
      .ant-form-item.hidden {
        display: none !important;
      }

      // 水平布局、垂直布局
      &.ant-form-horizontal {
        display: flex;
        flex-wrap: wrap;
        margin-right: 36px;

        .ant-form-item {
          display: inline-flex;
          margin-bottom: 0;
          width: 25%;

          .ant-input-affix-wrapper,
          .ant-select,
          .ant-cascader-picker,
          .ant-calendar-picker,
          .ant-time-picker,
          .tree-select {
            width: 100%;
          }

          .ant-form-item-control-input-content {
            & > .ant-input-number,
            & > .ant-picker {
              width: 100%;
            }
          }

          .ant-calendar-picker {
            span[class='ant-calendar-picker-input ant-input'] {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
