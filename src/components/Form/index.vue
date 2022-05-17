<template>
  <a-form ref="elForm" class="x-form" v-bind="$attrs" :layout="layout" :label-col="labelCol" :wrapper-col="wrapperCol">
    <!--栅格化布局-->
    <template v-if="gird">
      <a-row v-bind="rowProps">
        <template v-for="(column, index) in getColumns" :key="column?.field">
          <a-col v-bind="colProps">
            <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
              <slot name="formItemRender" :record="modelRef" :column="column" :index="index">
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
              <slot name="actionRender" :search="onSubmit" :reset="onReset"></slot>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
    </template>
    <!--正常表单-->
    <template v-else>
      <template v-for="(column, index) in getColumns" :key="column?.field">
        <a-form-item :label="column?.title" v-bind="validateInfos[column.field]">
          <slot name="formItemRender" :record="modelRef" :column="column" :index="index">
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
          <slot name="actionRender" :search="onSubmit" :reset="onReset"></slot>
        </a-form-item>
      </template>
    </template>
  </a-form>
</template>
<script>
import { computed, defineComponent, mergeProps, reactive, ref, unref } from 'vue'
import { Form } from 'ant-design-vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { omit, pick } from 'lodash-es'
import { formatFormModel, formatFormRules, formatFormValues } from './utils'
import { isEmpty } from '@src/utils'

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
        const allColumn = pick(column, ['type', 'title', 'field', 'rules', 'children'])
        // props
        const otherProps = omit(column, ['type', 'title', 'field', 'rules', 'children', 'props', 'events'])
        const allProps = mergeProps(otherProps, props)

        return { ...allColumn, modelValue: getModelValue(column?.type), props: allProps, events }
      })
    })

    const modelRef = reactive({})
    const rulesRef = reactive({})
    const { validate, resetFields, validateInfos } = Form.useForm(
      Object.assign(modelRef, formatFormModel(unref(getColumns))),
      Object.assign(rulesRef, formatFormRules(unref(getColumns)))
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
      return formatFormValues(unref(getColumns), modelRef)
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
    const hasActions = computed(() => !!slots['actionRender'])

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
