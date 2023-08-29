<template>
  <div :class="['x-list', canFullscreen ? 'x-list__fullscreen' : '']">
    <a-spin v-bind="spinProps">
      <!--搜索栏-->
      <div v-if="hasSearchBar" class="x-list__search">
        <x-search ref="xSearch" v-bind="searchProps" @search="handleSearch" @reset="handleReset" @clear="handleClear">
          <template #formItemRender="scope">
            <slot name="formItemRender" v-bind="scope"></slot>
          </template>
          <template v-if="hasTop" #top>
            <slot name="top"></slot>
          </template>
          <template v-if="hasBottom" #bottom>
            <slot name="bottom"></slot>
          </template>
        </x-search>
      </div>
      <!--工具栏-->
      <div v-if="hasToolBar" class="x-list__toolbar">
        <div class="toolbar">
          <slot name="toolBar"></slot>
        </div>
        <div v-if="customZoom" class="custom">
          <a-button shape="circle" size="middle" @click="toggleFullscreen">
            <template #icon>
              <FullscreenOutlined v-if="!canFullscreen" />
              <FullscreenExitOutlined v-else />
            </template>
          </a-button>
        </div>
      </div>
      <!--内容-->
      <a-list
        ref="xList"
        v-bind="$attrs"
        :loading="false"
        :row-key="rowKey"
        :data-source="dataSource"
        :pagination="false"
        :itemLayout="itemLayout"
        :grid="grid"
        :size="size"
        :locale="locale">
        <template v-if="hasHeader" #header>
          <slot name="header"></slot>
        </template>
        <template v-if="hasFooter" #footer>
          <slot name="footer"></slot>
        </template>
        <template v-if="hasLoadMore" #loadMore>
          <slot name="loadMore"></slot>
        </template>
        <template #renderItem="{ item, index }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <slot name="avatar" v-bind="{ item, index }"></slot>
              </template>
              <template #title>
                <slot name="title" v-bind="{ item, index }"></slot>
              </template>
              <template #description>
                <slot name="description" v-bind="{ item, index }"></slot>
              </template>
            </a-list-item-meta>
            <template #actions>
              <slot name="actions" v-bind="{ item, index }"></slot>
            </template>
            <template #extra>
              <slot name="extra" v-bind="{ item, index }"></slot>
            </template>
            <slot name="itemRender" v-bind="{ item, index }"></slot>
          </a-list-item>
        </template>
      </a-list>
      <x-pagination
        v-model:pagination="pages"
        :showPagination="showPagination"
        :total="total"
        :paginationConfig="paginationConfig"
        @change="handlePagination" />
    </a-spin>
  </div>
</template>

<script>
import { computed, defineComponent, reactive, ref, toRefs, watch, watchEffect } from 'vue'
import { List, Spin } from 'ant-design-vue'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import XSearch from '@components/Search'
import XPagination from '@components/Pagination'
import { useFullscreen } from '@components/hooks/useFullscreen'
import { isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XList',
  components: {
    FullscreenOutlined,
    FullscreenExitOutlined,
    'x-search': XSearch,
    'x-pagination': XPagination,
    'a-spin': Spin,
    'a-list': List,
    'a-list-item': List.Item,
    'a-list-item-meta': List.Item.Meta
  },
  inheritAttrs: false,
  props: {
    value: Object,
    searchProps: { type: Object, default: () => ({}) },
    // key 的取值
    rowKey: { type: [String, Function] },
    // 数据
    dataSource: { type: Array, default: () => [] },
    loading: { type: [Boolean, Object], default: false },
    emptyText: { type: String, default: '暂无数据' },
    // 页码
    showPagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    pagination: { type: Object, default: () => ({}) },
    paginationConfig: Object,
    // 列表栅格配置
    grid: Object,
    // 设置 List.Item 布局, 设置成 vertical 则竖直样式显示, 默认横排
    itemLayout: String,
    // 列表大小 large | middle | small
    size: {
      validator(value) {
        return ['large', 'middle', 'small'].includes(value)
      },
      default: 'middle'
    },
    // 默认文案设置，目前包括空数据文案
    locale: { type: Object },
    // 自定义缩放
    customZoom: { type: Boolean, default: false }
  },
  emits: ['update:value', 'update:pagination', 'search', 'reset', 'clear'],
  setup(props, { emit, slots, expose }) {
    const xList = ref(null)
    const xSearch = ref(null)

    const state = reactive({
      searchParams: {},
      pages: { page: 1, pageSize: 20 },
      scrollTop: 0
    })

    // 加载
    const spinProps = computed(() => {
      return typeof props.loading === 'object' ? props.loading : { spinning: props.loading }
    })

    // 页码赋值
    watchEffect(() => {
      if (!isEmpty(props.pagination)) {
        if ('page' in props.pagination) {
          state.pages.page = props.pagination.page
        }
        if ('current' in props.pagination) {
          state.pages.current = props.pagination.current
        }
        if ('pageSize' in props.pagination) {
          state.pages.pageSize = props.pagination.pageSize
        }
      }
    })

    // TODO：监听页码，当页码为1时，重置页码（父组件手动重置页码：如快捷搜索）
    watch(
      () => props.value?.page,
      page => {
        if (page && page === 1) {
          state.pages.page = 1
          state.pages.current = 1
        }
      }
    )

    // 搜索栏-搜索【重置页码】
    const handleSearch = params => {
      state.searchParams = params
      // 点击【搜索栏-搜索按钮】搜索时，重置页码为1
      if (props.showPagination) {
        state.pages.page = 1
        state.pages.current = 1
      }
      emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
      emit('search', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    /**
     * 搜索栏-重置
     * 1.重置时，默认会触发搜索事件
     * 2.重置时，需要重置页码为1
     * @param {*} params
     */
    const handleReset = params => {
      state.searchParams = params
      // 通过ref调用重置方法时，默认不搜索
      // 重置会触发搜索事件，搜索方法会重置page和更新value
      if (props.showPagination) {
        state.pages.page = 1
        state.pages.current = 1
      }
      // emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
      emit('reset', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    // 搜索栏-清空
    const handleClear = params => {
      state.searchParams = params
      emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
      emit('clear', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    // 分页器-搜索
    const handlePagination = () => {
      emit('update:pagination', state.pages)
      // 分页搜索
      emit('update:value', { ...state.searchParams, ...state.pages })
      emit('search', { ...state.searchParams, ...state.pages })
    }

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasTop = computed(() => !!slots['top'])
    const hasBottom = computed(() => !!slots['bottom'])
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasHeader = computed(() => !!slots['header'])
    const hasFooter = computed(() => !!slots['footer'])
    const hasLoadMore = computed(() => !!slots['loadMore'])

    // 全屏功能
    const { canFullscreen, toggleFullscreen } = useFullscreen(xList, { fullscreen: props.customZoom })

    expose({
      xList,
      xSearch,
      onToggleFullscreen: toggleFullscreen
    })

    return {
      xList,
      xSearch,
      ...toRefs(state),
      hasSearchBar,
      hasTop,
      hasBottom,
      hasToolBar,
      hasHeader,
      hasFooter,
      hasLoadMore,
      spinProps,
      handleSearch,
      handleReset,
      handleClear,
      handlePagination,
      canFullscreen,
      toggleFullscreen
    }
  }
})
</script>
<style lang="scss" scoped>
.x-list {
  height: 100%;
  background-color: #f0f2f5;

  & > :deep(.ant-spin-nested-loading) {
    height: 100%;

    & > .ant-spin-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  &__search {
    margin-bottom: 10px;
  }

  &__toolbar {
    display: flex;
    padding: 0 10px;
    background-color: #fff;
    margin-bottom: 10px;

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
      margin: 10px 0;
    }

    .custom {
      padding: 10px 0 10px 10px;
    }
  }

  :deep(.ant-list) {
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #fff;
    overflow: hidden;
    .ant-list-header,
    .ant-list-footer {
      padding: 0;
    }
    .ant-spin-nested-loading {
      flex: 1;
      overflow: hidden;
      .ant-spin-container {
        height: 100%;
      }
    }
    .ant-list-items {
      height: 100%;
      overflow-y: auto;
    }
  }

  .x-pagination {
    padding: 10px;
  }

  // 全屏
  &__fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    z-index: 10001;
  }
}
</style>
