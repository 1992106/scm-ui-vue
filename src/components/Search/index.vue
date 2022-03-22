<template>
  <div class="my-search">
    <a-form class="form" layout="horizontal" :label-col="labelCol" :wrapper-col="wrapperCol">
      <template v-for="column in getColumns" :key="column.slot || column.field">
        <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
          <template v-if="column.slot">
            <template #[column.slot]="scope">
              <slot :name="column.slot" v-bind="scope"></slot>
            </template>
          </template>
          <template v-else>
            <component
              :is="column.type"
              v-model:[column.modelValue]="modelRef[column.field]"
              v-bind="column.props || {}"
              v-on="column.events || {}"
            ></component>
          </template>
        </a-form-item>
      </template>
      <div class="actions">
        <a-space>
          <template v-if="showSearch">
            <a-button type="primary" @click.prevent="handleSearch">{{ searchText }}</a-button>
          </template>
          <template v-if="showReset">
            <a-button @click="handleReset">{{ resetText }}</a-button>
          </template>
          <div class="expand" v-if="isShowExpand" @click="handleExpand">
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
    <div class="shortcut" v-if="showShortcut">
      <slot name="shortcut"></slot>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, mergeProps, nextTick, onMounted, reactive, ref, toRaw, unref } from 'vue'
import { Button, Form, Space } from 'ant-design-vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { omit, pick } from 'lodash-es'
import { useFormLayout } from './useFormLayout'
import { defaultState, emitPropsDisabled, mergeEvents, omitEmpty } from './utils'
import { dateToDayjs, dayjsToDate, isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XSearch',
  inheritAttrs: false,
  props: {
    // 自定义字段
    columns: { type: Array, required: true, default: () => [] },
    // 重置搜索
    resetSearch: { type: Boolean, default: true },
    // 清空搜索
    clearSearch: { type: Boolean, default: false },
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
    defaultExpand: { type: Boolean, default: false },
    showExpand: { type: Boolean, default: true }
  },
  emits: ['search', 'reset', 'clear'],
  components: {
    DownOutlined,
    UpOutlined,
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-button': Button,
    'a-space': Space
  },
  setup(props, { emit, slots }) {
    // 默认事件
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
        const { props = {}, events = {}, slot } = emitPropsDisabled(column)
        const defaultAllState = defaultState[column?.type] || {}
        // column
        const allColumn = pick(column, ['type', 'title', 'field', 'rules'])
        // props
        const defaultProps = defaultAllState.props || {}
        const otherProps = omit(column, ['type', 'title', 'field', 'slot', 'rules', 'props', 'events'])
        const allProps = toRaw(mergeProps(defaultProps, otherProps, props))
        // events
        const defaultEvents = defaultAllState.events || []
        const allEvents = mergeEvents(defaultEventsMap, defaultEvents, events)
        return { ...allColumn, modelValue: getModelValue(column?.type), props: allProps, events: allEvents, slot }
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
      const params = getColumns.value.reduce((prev, column) => {
        const value = modelRef[column.field]
        prev[column.field] = hasDate(column) ? dayjsToDate(value, column?.props?.valueFormat) : value
        return prev
      }, {})
      return omitEmpty(params)
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

    // 设置表单值
    const setFieldValue = (field, value) => {
      Object.assign(modelRef, { [field]: value })
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

    // 是否显示快捷搜索
    const showShortcut = computed(() => !!slots['shortcut'])

    return {
      showShortcut,
      getModelValue,
      getColumns,
      modelRef,
      validateInfos,
      handleSearch,
      handleReset,
      handleClear,
      setFieldValue,
      isExpand,
      isShowExpand,
      handleExpand
    }
  }
})
</script>
<style lang="less" scoped>
.my-search {
  .form {
    .ant-form-item {
      line-height: 40px;
      &.hidden {
        display: none !important;
      }
    }
    .actions {
      display: flex;
      flex: 1;
      :deep(.expand) {
        cursor: pointer;
        min-width: 50px;
      }
    }
  }
}
</style>
