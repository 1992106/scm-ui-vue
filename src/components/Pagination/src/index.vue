<template>
  <a-pagination
    v-if="showPagination"
    v-bind="getPaginationConfig"
    class="x-pagination"
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
import { computed, defineComponent, mergeProps, unref } from 'vue'
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
  setup(props, { emit, slots, attrs, expose }) {
    const defaultState = {
      defaultPaginationConfig: {
        defaultPageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['20', '40', '60', '80', '100']
      }
    }

    // 是否显示较少页面内容
    const showLessItems = computed(() => {
      const _showLessItems = attrs?.showLessItems ?? props.paginationConfig?.showLessItems
      return typeof _showLessItems === 'undefined' ? false : _showLessItems
    })

    // 页码
    const pages = computed(() => {
      const { page, current, pageSize } = props.pagination
      // 兼容 ant 和 设置默认值
      return {
        page: page || current || attrs?.current || 1, // current和attrs?.current是为了兼容 antv 原始用法
        pageSize: pageSize || attrs?.pageSize || (unref(showLessItems) ? 10 : 20)
      }
    })

    // 页码配置
    const getPaginationConfig = computed(() => {
      // attrs是为了兼容 antv 原始用法
      return showLessItems.value
        ? mergeProps({ size: 'small' }, attrs, props.paginationConfig)
        : mergeProps(defaultState.defaultPaginationConfig, attrs, props.paginationConfig)
    })

    const handlePageChange = (current, pageSize) => {
      const pagination = {
        current,
        page: current,
        pageSize
      }
      emit('update:pagination', pagination)
      emit('change', current, pageSize)
    }

    const handleShowSizeChange = (current, pageSize) => {
      emit('showSizeChange', current, pageSize)
    }

    // 是否显示插槽
    const hasItemRender = computed(() => !isEmpty(slots['itemRender']))

    expose({})

    return {
      pages,
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
