<template>
  <a-form ref="xForm" class="x-edit-table" :model="modelRef">
    <x-table ref="xEditTable" v-bind="$attrs" :columns="getColumns" :dataSource="dataSource">
      <!--搜索栏-->
      <template v-if="hasSearchBar" #searchBar>
        <slot name="searchBar"></slot>
      </template>
      <!--工具栏-->
      <template v-if="hasToolBar" #toolBar>
        <slot name="toolBar"></slot>
      </template>
      <template #bodyCell="{ text, record, column, index }">
        <slot name="bodyCell" v-bind="{ text, record, column, index }">
          <template v-if="column.type">
            <a-form-item
              :name="['dataSource', index, column.dataIndex]"
              :rules="[
                ...(column?.required
                  ? [
                      {
                        required: column?.required,
                        message: `${column.title}为必填项`
                      }
                    ]
                  : []),
                ...(column?.rules ? column?.rules : [])
              ]">
              <component
                :is="column.type"
                v-bind="column?.props || {}"
                v-model:[column.modelValue]="record[column.dataIndex]"
                v-on="column?.events || {}"></component>
            </a-form-item>
          </template>
        </slot>
      </template>
      <!--插槽-->
      <template v-for="slot of getTableSlots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
    </x-table>
  </a-form>
</template>
<script>
import { computed, defineComponent, reactive, ref, toRefs, watchEffect } from 'vue'
import XTable from '@components/Table'
import { isEmpty } from '@src/utils'
import { formatDefaultDate, getModelValue, hasDate } from '@components/Form/src/utils'
export default defineComponent({
  name: 'XEditTable',
  components: {
    'x-table': XTable
  },
  inheritAttrs: false,
  props: {
    // 自定义列
    columns: { type: Array, required: true, default: () => [] },
    // 表格数据
    dataSource: { type: Array, default: () => [] }
  },
  setup(props, { slots, expose }) {
    const xForm = ref(null)
    const xEditTable = ref(null)
    const modelRef = reactive({
      dataSource: []
    })

    // 获取格式化后的columns
    const getColumns = computed(() => {
      return props.columns.map(column => {
        const { props = {}, events = {} } = column
        // 格式化时间
        if (hasDate(column)) {
          formatDefaultDate(props)
        }

        return { ...column, modelValue: getModelValue(column?.type), props: props, events }
      })
    })

    watchEffect(() => {
      modelRef.dataSource = props.dataSource
    })

    const state = reactive({})

    // table插槽
    const getTableSlots = computed(() => {
      return Object.keys(slots).filter(val =>
        [
          'headerCell',
          // 'bodyCell',
          'customFilterDropdown',
          'customFilterIcon',
          'expandedRowRender',
          'expandIcon',
          'title',
          'footer',
          'summary',
          'emptyText'
        ].includes(val)
      )
    })

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasToolBar = computed(() => !!slots['toolBar'])

    // 重置表单
    const onResetFields = nameList => {
      xForm.value.resetFields(nameList)
    }
    // 验证表单
    const onValidate = async nameList => {
      return await xForm.value.validate(nameList)
    }

    expose({
      xForm,
      xEditTable,
      onResetFields,
      onValidate
    })

    return {
      xForm,
      xEditTable,
      getColumns,
      modelRef,
      ...toRefs(state),
      hasSearchBar,
      hasToolBar,
      getTableSlots
    }
  }
})
</script>
<style lang="scss" scoped>
.x-edit-table {
  .x-table {
    .ant-form-item {
      margin-bottom: 0;
      .ant-select {
        width: 100%;
      }
    }
  }
}
</style>
