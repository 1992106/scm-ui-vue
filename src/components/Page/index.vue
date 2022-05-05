<template>
  <div class="my-page">
    <a-spin v-bind="spinProps">
      <x-search
        ref="xSearch"
        show-expand
        layout="horizontal"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
        v-bind="searchProps"
        @search="handleSearch"
        @reset="handleReset"
        @clear="handleClear">
        <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
        <template v-if="hasExtra" #extra>
          <slot name="extra"></slot>
        </template>
        <template v-if="hasShortcut" #shortcut>
          <slot name="shortcut"></slot>
        </template>
      </x-search>
      <!--工具栏-->
      <div v-if="hasToolBar" class="toolbar">
        <slot name="toolBar"></slot>
      </div>
      <!--内容-->
      <div class="content">
        <slot>
          <div v-if="dataSource.length" class="section">
            <template v-for="(item, index) in dataSource">
              <slot name="renderItem" :item="item" :index="index"></slot>
            </template>
            <!--分页-->
            <a-pagination
              v-if="showPagination"
              v-bind="getPaginationConfig"
              :current="pagination.page"
              :page-size="pagination.pageSize"
              :total="total"
              @change="handlePageChange"
              @showSizeChange="handleShowSizeChange" />
          </div>
          <div v-else class="empty">
            <a-empty :description="emptyText" />
          </div>
        </slot>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { computed, defineComponent, mergeProps, onMounted, reactive, ref, toRefs, watchEffect } from 'vue'
import XSearch from '@components/Search/index.vue'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XPage',
  components: {
    'x-search': XSearch
  },
  inheritAttrs: false,
  props: {
    value: Object,
    searchProps: { type: Object, default: () => ({}) },
    // 数据
    dataSource: { type: Array, default: () => [] },
    loading: { type: [Boolean, Object], default: false },
    total: { type: Number, default: 0 },
    emptyText: { type: String, default: '暂无数据' },
    // 页码
    showPagination: { type: Boolean, default: true },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 20 }) },
    paginationConfig: Object
  },
  emits: ['update:value', 'update:pagination', 'search', 'reset', 'clear'],
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

    const xSearch = ref(null)
    const state = reactive({
      pagination: props.pagination
    })

    watchEffect(() => {
      if (!isEmpty(props.pagination)) {
        state.pagination = props.pagination
      }
    })

    // 加载
    const spinProps = computed(() => {
      return typeof props.loading === 'object' ? props.loading : { spinning: props.loading }
    })

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props.searchProps.columns
      return (columns || []).map(col => col.slot).filter(Boolean)
    })
    const getPaginationConfig = computed(() => mergeProps(defaultState.defaultPaginationConfig, props.paginationConfig))

    // 页码
    const handlePageChange = (current, pageSize) => {
      const pagination = {
        page: current,
        pageSize
      }
      emit('update:pagination', pagination)
      emit('search')
    }
    const handleShowSizeChange = (_, pageSize) => {
      const pagination = {
        page: 1,
        pageSize
      }
      emit('update:pagination', pagination)
      emit('search')
    }

    const handleSearch = $event => {
      emit('update:value', $event)
      emit('search', $event)
    }

    const handleReset = $event => {
      emit('update:value', $event)
      emit('reset', $event)
    }

    const handleClear = $event => {
      emit('update:value', $event)
      emit('clear', $event)
    }

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasExtra = computed(() => !!slots['extra'])
    const hasShortcut = computed(() => !!slots['shortcut'])
    const hasToolBar = computed(() => !!slots['toolBar'])

    onMounted(() => {})

    return {
      xSearch,
      ...toRefs(state),
      hasSearchBar,
      hasExtra,
      hasShortcut,
      hasToolBar,
      spinProps,
      getSearchSlots,
      getPaginationConfig,
      handleSearch,
      handleReset,
      handleClear,
      handlePageChange,
      handleShowSizeChange
    }
  }
})
</script>
<style lang="scss" scoped>
.my-page {
  height: 100%;
  background-color: #f0f2f5;

  :deep(.ant-spin-nested-loading) {
    height: 100%;

    .ant-spin-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 10px;
    margin-bottom: 10px;
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    background-color: #fff;

    .section {
      flex: 1;
    }

    .empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-pagination {
      padding: 10px;
      text-align: right;
      background-color: #fff;
    }
  }
}
</style>
