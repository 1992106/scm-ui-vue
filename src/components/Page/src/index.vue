<template>
  <div ref="xPage" :class="['x-page', canFullscreen ? 'x-page__fullscreen' : '']">
    <a-spin v-bind="spinProps">
      <!--搜索栏-->
      <template v-if="hasSearchBar">
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
      </template>
      <!--工具栏-->
      <div v-if="hasToolBar" class="x-page__toolbar">
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
      <x-scroll-container ref="XScrollContainer" class="x-page__container">
        <slot>
          <div v-if="dataSource.length" class="x-page__render">
            <div v-if="hasHeader" class="x-page__header">
              <slot name="header"></slot>
            </div>
            <x-scroll-container ref="XScroll" class="scroll">
              <a-row v-bind="rowProps">
                <template v-for="(item, index) in dataSource" :key="getValueByRowKey(rowKey, item, index)">
                  <a-col v-bind="colProps">
                    <slot name="itemRender" :record="item" :index="index"></slot>
                  </a-col>
                </template>
              </a-row>
            </x-scroll-container>
            <div v-if="hasFooter" class="x-page__footer">
              <slot name="footer"></slot>
            </div>
            <x-pagination
              v-model:pagination="pages"
              :showPagination="showPagination"
              :total="total"
              :paginationConfig="paginationConfig"
              @change="handlePagination" />
          </div>
          <div v-else class="empty">
            <a-empty :image="simpleImage" :description="emptyText" />
          </div>
        </slot>
      </x-scroll-container>
    </a-spin>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, ref, toRefs, unref, watch, watchEffect } from 'vue'
import { Empty, Spin } from 'ant-design-vue'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import XSearch from '@components/Search'
import XPagination from '@components/Pagination'
import { XScrollContainer } from '@components/Container/index'
import { getValueByRowKey } from '@components/Table/src/utils'
import { useAppHeight } from '@components/hooks/useSearch'
import { useFullscreen } from '@components/hooks/useFullscreen'
import { isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XPage',
  components: {
    FullscreenOutlined,
    FullscreenExitOutlined,
    'x-search': XSearch,
    'x-pagination': XPagination,
    'x-scroll-container': XScrollContainer,
    'a-spin': Spin,
    'a-empty': Empty
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
    // 布局
    rowProps: Object,
    colProps: Object,
    // 自动计算表格
    autoResize: { type: Boolean, default: true },
    // 页码
    showPagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    pagination: { type: Object, default: () => ({}) },
    paginationConfig: Object,
    // 自定义缩放
    customZoom: { type: Boolean, default: false }
  },
  emits: ['update:value', 'update:pagination', 'search', 'reset', 'clear'],
  setup(props, { emit, slots, expose }) {
    const xPage = ref(null)
    const xSearch = ref(null)
    const XScrollContainer = ref(null)
    const XScroll = ref(null)

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
      handleScrollTo()
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
      // 点击【搜索栏-重置按钮】会触发搜索事件，搜索方法会重置page和更新value
      if (props.showPagination) {
        state.pages.page = 1
        state.pages.current = 1
      }
      emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
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
      handleScrollTo()
    }

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasTop = computed(() => !!slots['top'])
    const hasBottom = computed(() => !!slots['bottom'])
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasHeader = computed(() => !!slots['header'])
    const hasFooter = computed(() => !!slots['footer'])

    // 自动计算高度
    useAppHeight(props.autoResize)

    // 全屏功能
    const { canFullscreen, toggleFullscreen } = useFullscreen(xPage, { fullscreen: props.customZoom })

    // 滚动顶部
    const handleScrollTo = () => {
      if (unref(XScroll)) {
        unref(XScroll)?.onScrollTo?.()
      } else {
        unref(XScrollContainer)?.onScrollTo?.()
      }
    }

    // 初始化调用一下，获取搜索参数
    const onInit = () => {
      const params = unref(xSearch)?.onGetFormValues() || {}
      emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    onMounted(() => {
      onInit()
    })

    expose({
      xPage,
      xSearch,
      onToggleFullscreen: toggleFullscreen,
      onScrollTo: handleScrollTo
    })

    return {
      xPage,
      xSearch,
      XScrollContainer,
      XScroll,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      ...toRefs(state),
      hasSearchBar,
      hasTop,
      hasBottom,
      hasToolBar,
      hasHeader,
      hasFooter,
      spinProps,
      handleSearch,
      handleReset,
      handleClear,
      handlePagination,
      canFullscreen,
      toggleFullscreen,
      getValueByRowKey
    }
  }
})
</script>
<style lang="scss" scoped>
.x-page {
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

  .x-search {
    margin-bottom: 10px;
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  &__container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #fff;

    .x-page__render {
      display: flex;
      flex-direction: column;
      height: 100%;

      .scroll {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .x-pagination {
        padding: 10px;
      }
    }

    .empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
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
