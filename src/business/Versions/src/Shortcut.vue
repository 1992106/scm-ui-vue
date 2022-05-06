<template>
  <div class="shortcut-bar">
    <div class="title">更多搜索条件</div>
    <x-form ref="xForm" layout="vertical" v-bind="$attrs" :columns="getColumns">
      <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
    </x-form>
  </div>
</template>
<script>
import { computed, defineComponent, ref, unref } from 'vue'
import XForm from '@components/Form/index.vue'
import { toDisabled } from '@components/Form/utils'

export default defineComponent({
  name: 'Shortcut',
  components: {
    'x-form': XForm
  },
  setup(props, { attrs }) {
    const xForm = ref(null)

    // 搜索columns
    const getColumns = computed(() => {
      const columns = attrs?.columns || []
      return columns.map(column => toDisabled(column))
    })

    // 搜索slots
    const getSearchSlots = computed(() => {
      const columns = attrs?.columns || []
      return columns.map(col => col.slot).filter(Boolean)
    })

    const onGetFormValue = () => {
      return unref(xForm)?.onGetFormValue?.()
    }

    const onResetFormValue = () => {
      return unref(xForm)?.onResetFormValue?.()
    }

    return {
      xForm,
      getColumns,
      getSearchSlots,
      onGetFormValue,
      onResetFormValue
    }
  }
})
</script>
<style lang="scss" scoped>
.shortcut-bar {
  width: 240px;
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
