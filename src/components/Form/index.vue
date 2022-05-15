<template>
  <a-form ref="elForm" class="x-form" v-bind="$attrs" :layout="layout" :label-col="labelCol" :wrapper-col="wrapperCol">
    <!--栅格化布局-->
    <template v-if="gird">
      <a-row v-bind="rowProps">
        <template v-for="(column, index) in getColumns" :key="column?.field">
          <a-col v-bind="colProps">
            <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
              <slot name="formItem" :column="column" :index="index">
                <component
                  :is="column.type"
                  v-model:[column.modelValue]="modelRef[column.field]"
                  v-bind="column?.props || {}"
                  v-on="column?.events || {}"></component>
              </slot>
            </a-form-item>
          </a-col>
        </template>
        <template v-if="hasActions">
          <a-col class="actions" v-bind="colProps">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <slot name="renderActions" :search="onSubmit" :reset="onReset"></slot>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
    </template>
    <!--正常表单-->
    <template v-else>
      <template v-for="(column, index) in getColumns" :key="column?.field">
        <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
          <slot name="formItem" :column="column" :index="index">
            <component
              :is="column.type"
              v-model:[column.modelValue]="modelRef[column.field]"
              v-bind="column?.props || {}"
              v-on="column?.events || {}"></component>
          </slot>
        </a-form-item>
      </template>
      <template v-if="hasActions">
        <a-form-item>
          <slot name="renderActions" :search="onSubmit" :reset="onReset"></slot>
        </a-form-item>
      </template>
    </template>
  </a-form>
</template>
<script>
import { computed, defineComponent, mergeProps, reactive, ref, toRaw, unref } from 'vue'
import { Form } from 'ant-design-vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { omit, pick } from 'lodash-es'
import { formatRules, hasDate, hasMultiple, toEmpty } from './utils'
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
    colProps: { type: Object, default: () => ({}) }
  },
  emits: ['submit', 'reset'],
  setup(props, { emit, slots }) {
    const elForm = ref(null)

    // 获取v-model绑定名称
    const getModelValue = type => (['ASwitch'].includes(type) ? 'checked' : 'value')
    // 获取格式化后的columns
    const getColumns = computed(() => {
      return props.columns.map(column => {
        const { props = {}, events = {} } = column
        // column
        const allColumn = pick(column, ['type', 'title', 'field', 'rules'])
        // props
        const otherProps = omit(column, ['type', 'title', 'field', 'rules', 'props', 'events'])
        const allProps = toRaw(mergeProps(otherProps, props))

        return { ...allColumn, modelValue: getModelValue(column?.type), props: allProps, events }
      })
    })

    const modelRef = reactive({})
    const getModel = computed(() => {
      return unref(getColumns).reduce((prev, next) => {
        // 在使用useForm时，需要手动设置默认值
        let value = ['defaultValue', 'defaultPickerValue'].map(val => next?.props[val]).find(Boolean)
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

    const rulesRef = reactive({})
    const getRules = computed(() => {
      return formatRules(unref(getColumns))
    })

    const { validate, resetFields, validateInfos } = Form.useForm(
      Object.assign(modelRef, unref(getModel)),
      Object.assign(rulesRef, unref(getRules))
    )

    // 提交
    const onSubmit = () => {
      emit('submit', onGetFormValues())
    }

    // 重置
    const onReset = () => {
      resetFields()
      emit('reset', onGetFormValues())
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

    // 是否显示插槽
    const hasActions = computed(() => !!slots['renderActions'])

    return {
      elForm,
      hasActions,
      getColumns,
      modelRef,
      validate,
      resetFields,
      validateInfos,
      onSubmit,
      onReset,
      onGetFormValues,
      onSetFieldValue
    }
  }
})
</script>
