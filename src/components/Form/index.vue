<template>
  <a-form ref="elForm" class="x-form" v-bind="$attrs" :layout="layout" :label-col="labelCol" :wrapper-col="wrapperCol">
    <!--栅格化布局-->
    <template v-if="gird">
      <a-row v-bind="rowProps">
        <template v-for="(column, i) in getColumns" :key="column?.field || column?.slot">
          <a-col v-show="expand || i < getIndex" v-bind="colProps">
            <template v-if="column.type">
              <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
                <component
                  :is="column.type"
                  v-model:[column.modelValue]="modelRef[column.field]"
                  v-bind="column?.props || {}"
                  v-on="column?.events || {}"></component>
              </a-form-item>
            </template>
            <!--自定义slot-->
            <template v-else>
              <a-form-item :label="column?.title">
                <slot :name="column.slot"></slot>
              </a-form-item>
            </template>
          </a-col>
        </template>
        <template v-if="hasActions">
          <a-col class="actions" v-bind="colProps" :push="getPush">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <slot name="actions"></slot>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
    </template>
    <!--正常表单-->
    <template v-else>
      <template v-for="column in getColumns" :key="column?.field || column?.slot">
        <template v-if="column.type">
          <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
            <component
              :is="column.type"
              v-model:[column.modelValue]="modelRef[column.field]"
              v-bind="column?.props || {}"
              v-on="column?.events || {}"></component>
          </a-form-item>
        </template>
        <!--自定义slot-->
        <template v-else>
          <a-form-item :label="column?.title">
            <slot :name="column.slot"></slot>
          </a-form-item>
        </template>
      </template>
      <template v-if="hasActions">
        <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
          <slot name="actions"></slot>
        </a-form-item>
      </template>
    </template>
  </a-form>
</template>
<script>
import { computed, defineComponent, mergeProps, nextTick, reactive, ref, toRaw, unref } from 'vue'
import { Form } from 'ant-design-vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { omit, pick } from 'lodash-es'
import { mergeEvents, toEmpty } from './utils'
import { dateToDayjs, dayjsToDate, isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XForm',
  components: {
    DownOutlined,
    UpOutlined
  },
  inheritAttrs: false,
  props: {
    // 自定义字段
    columns: { type: Array, required: true, default: () => [] },
    // 表单布局
    layout: {
      validator(value) {
        return ['horizontal', 'vertical', 'inline'].includes(value)
      },
      default: 'horizontal'
    },
    // 标签布局
    labelCol: { type: Object, default: () => ({}) },
    // 控件布局
    wrapperCol: { type: Object, default: () => ({}) },
    // 是否栅格化布局
    gird: { type: Boolean, default: false },
    // row
    rowProps: { type: Object, default: () => ({}) },
    // col
    colProps: { type: Object, default: () => ({}) },
    // 是否展开，默认展开（用于控制搜索栏显示/隐藏）
    expand: { type: Boolean, default: true }
  },
  emits: ['enter', 'clear'],
  setup(props, { emit, slots }) {
    const elForm = ref(null)

    const getIndex = computed(() => {
      if (props.gird && props.colProps?.span) {
        return 24 / props.colProps.span - 1
      } else {
        return getColumns.value.length
      }
    })

    const getPush = computed(() => {
      if (props.expand && props.gird && props.colProps?.span) {
        const multiple = 24 / props.colProps.span
        const length = getColumns.value.length
        return (multiple - (length % multiple) - 1) * props.colProps.span
      } else {
        return 0
      }
    })

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
          emit('clear', onGetFormValues())
        }
      },
      clear: () => {
        // Select
        nextTick(() => {
          emit('clear', onGetFormValues())
        })
      },
      // 实现enter搜索功能
      pressEnter: () => {
        // Input/InputNumber组件
        emit('enter', onGetFormValues())
      }
    }
    // 获取v-model绑定名称
    const getModelValue = type => (['ASwitch'].includes(type) ? 'checked' : 'value')
    // 获取格式化后的columns
    const getColumns = computed(() => {
      return props.columns.map(column => {
        const { props = {}, events = {} } = column
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

    // 是否显示插槽
    const hasActions = computed(() => !!slots['actions'])

    // 重置表单
    const onResetFields = () => {
      resetFields()
    }

    // 获取表单值
    const onGetFormValues = () => {
      const params = unref(getColumns).reduce((prev, column) => {
        const value = modelRef[column.field]
        prev[column.field] = hasDate(column) ? dayjsToDate(value, column?.props?.valueFormat) : value
        return prev
      }, {})
      return toEmpty(params)
    }

    // 设置表单字段和值
    const onSetFieldValue = obj => {
      if (!isEmpty(obj)) {
        Object.keys(obj).forEach(field => {
          Object.assign(modelRef, { [field]: obj[field] })
        })
      }
    }

    return {
      elForm,
      getIndex,
      getPush,
      hasActions,
      getModelValue,
      getColumns,
      modelRef,
      validate,
      resetFields,
      validateInfos,
      onResetFields,
      onGetFormValues,
      onSetFieldValue
    }
  }
})
</script>
