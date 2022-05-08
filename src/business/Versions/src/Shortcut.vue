<template>
  <div class="shortcut-bar">
    <div class="title">更多搜索条件</div>
    <x-form
      ref="xForm"
      layout="vertical"
      v-bind="$attrs"
      :columns="getColumns"
      :row-props="rowProps"
      :col-props="colProps">
      <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
    </x-form>
  </div>
</template>
<script>
import { computed, defineComponent, ref, unref } from 'vue'
import XForm from '@components/Form/index.vue'
import { toDisabled } from '@components/Search/utils'

export default defineComponent({
  name: 'Shortcut',
  components: {
    'x-form': XForm
  },
  props: {
    // row
    rowProps: { type: Object, default: () => ({ gutter: 24 }) },
    // col
    colProps: { type: Object, default: () => ({ md: 12, xl: 8 }) }
  },
  setup(props, { attrs }) {
    const xForm = ref(null)

    // 搜索columns
    const getColumns = computed(() => {
      const columns = attrs?.columns || []
      return columns.map(column => toDisabled(column)) // disabled: true => false
    })

    // 搜索slots
    const getSearchSlots = computed(() => {
      const columns = attrs?.columns || []
      return columns.map(col => col.slot).filter(Boolean)
    })

    const onGetFormValues = () => {
      return unref(xForm)?.onGetFormValues?.()
    }

    const onResetFields = () => {
      return unref(xForm)?.onReset?.()
    }

    return {
      xForm,
      getColumns,
      getSearchSlots,
      onGetFormValues,
      onResetFields
    }
  }
})
</script>
<style lang="scss" scoped>
.shortcut-bar {
  width: 320px;
  padding: 0 10px;
  border: 1px solid #c8c7cc;
  overflow-y: auto;

  .title {
    line-height: 32px;
    border-bottom: 1px solid #c8c7cc;
    margin-bottom: 10px;
  }

  .x-form {
    padding: 0 6px;

    :deep(.ant-form-item) {
      margin-bottom: 10px;

      .ant-form-item-label {
        padding-bottom: 0;
      }
    }
  }
}
</style>
