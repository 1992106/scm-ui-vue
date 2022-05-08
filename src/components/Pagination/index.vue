<template>
  <a-pagination
    v-if="showPagination"
    v-bind="getPaginationConfig"
    :current="pages.page"
    :page-size="pages.pageSize"
    :total="total"
    @change="handlePageChange"
    @showSizeChange="handleShowSizeChange">
    <template v-if="hasItemRender" #itemRender="scope">
      <slot name="itemRender" v-bind="scope"></slot>
    </template>
  </a-pagination>
</template>

<script>
import { computed, defineComponent, mergeProps, reactive, toRefs, watchEffect } from 'vue'
import { Pagination } from 'ant-design-vue'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XPagination',
  components: {
    'a-pagination': Pagination
  },
  inheritAttrs: false,
  props: {
    showPagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    pagination: { type: Object, default: () => ({}) },
    paginationConfig: Object
  },
  emits: ['update:pagination', 'change', 'showSizeChange'],
  setup(props, { emit, slots }) {
    const defaultState = {
      defaultPaginationConfig: {
        defaultPageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['20', '40', '60', '80', '100']
      }
    }

    const state = reactive({
      pages: { page: 1, pageSize: 20 }
    })

    watchEffect(() => {
      if (!isEmpty(props.pagination)) {
        state.pages = props.pagination
      }
    })

    // 页码配置
    const getPaginationConfig = computed(() => mergeProps(defaultState.defaultPaginationConfig, props.paginationConfig))

    // 页码
    const handlePageChange = (current, pageSize) => {
      const pagination = {
        page: current,
        pageSize
      }
      emit('update:pagination', pagination)
      emit('change', current, pageSize)
    }
    const handleShowSizeChange = (current, pageSize) => {
      emit('showSizeChange', current, pageSize)
    }

    const hasItemRender = computed(() => !isEmpty(slots['itemRender']))

    return {
      ...toRefs(state),
      getPaginationConfig,
      hasItemRender,
      handlePageChange,
      handleShowSizeChange
    }
  }
})
</script>
<style lang="scss" scoped>
.ant-pagination {
  text-align: right;
  background-color: #fff;
}
</style>
