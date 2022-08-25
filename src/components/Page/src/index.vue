<template>
  <div ref="xPage" class="x-page">
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
      <div v-if="hasToolBar" class="toolbar">
        <slot name="toolBar"></slot>
      </div>
      <!--内容-->
      <div class="x-page__container">
        <slot>
          <div v-if="dataSource.length" class="x-page__render">
            <div class="scroll" @scroll="handleScroll">
              <a-row v-bind="rowProps">
                <template v-for="(item, index) in dataSource" :key="getValueByRowKey(rowKey, item, index)">
                  <a-col v-bind="colProps">
                    <slot name="itemRender" :record="item" :index="index"></slot>
                  </a-col>
                </template>
              </a-row>
            </div>
            <x-pagination
              v-model:pagination="pages"
              :showPagination="showPagination"
              :total="total"
              :paginationConfig="paginationConfig"
              @change="handleQuery" />
          </div>
          <div v-else class="empty">
            <a-empty :image="simpleImage" :description="emptyText" />
          </div>
        </slot>
      </div>
    </a-spin>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  nextTick,
  onActivated,
  onMounted,
  reactive,
  ref,
  toRefs,
  unref,
  watch,
  watchEffect
} from 'vue'
import { Empty, Spin } from 'ant-design-vue'
import XSearch from '@components/Search'
import XPagination from '@components/Pagination'
import { getValueByRowKey } from '@components/Table/src/utils'
import { useAppHeight } from '@components/hooks/useSearch'
import { isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XPage',
  components: {
    'x-search': XSearch,
    'x-pagination': XPagination,
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
    paginationConfig: Object
  },
  emits: ['update:value', 'update:pagination', 'search', 'reset', 'clear'],
  setup(props, { emit, slots, expose }) {
    const xPage = ref(null)
    const xSearch = ref(null)

    const state = reactive({
      searchParams: {},
      pages: { page: 1, pageSize: 20 },
      scrollTop: 0
    })

    // 页码赋值
    watchEffect(() => {
      if (!isEmpty(props.pagination)) {
        state.pages = props.pagination
      }
    })

    // 加载
    const spinProps = computed(() => {
      return typeof props.loading === 'object' ? props.loading : { spinning: props.loading }
    })

    // TODO：监听页码，当页码为1时，重置页码（父组件手动重置页码：如快捷搜索）
    watch(
      () => props.value?.page,
      page => {
        if (page && page === 1) {
          state.pages.page = 1
        }
      }
    )

    // 滚动到顶部
    const onScrollTop = (to = 0) => {
      const el = unref(xPage)?.querySelector('.x-page__container .x-page__render .scroll')
      if (el) {
        el.scrollTop = to
        // 动画效果实现滚动
        // scrollTop(el, el.scrollTop, to)
      }
    }

    // 监听数据源，变化时滚动置顶
    watch(
      () => props.dataSource,
      () => {
        nextTick(onScrollTop)
      }
    )

    // 分页器-搜索
    const handleQuery = () => {
      emit('update:pagination', state.pages)
      // 分页搜索
      emit('update:value', { ...state.searchParams, ...state.pages })
      emit('search', { ...state.searchParams, ...state.pages })
    }

    // 搜索栏-搜索【重置页码】
    const handleSearch = params => {
      state.searchParams = params
      // 点击【搜索栏-搜索按钮】搜索时，重置页码为1
      if (props.showPagination) {
        state.pages.page = 1
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
      // 重置会触发搜索事件，搜索方法会重置page和更新value
      // if (props.showPagination) {
      //   state.pages.page = 1
      // }
      // emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
      emit('reset', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    // 搜索栏-清空
    const handleClear = params => {
      state.searchParams = params
      emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
      emit('clear', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasTop = computed(() => !!slots['top'])
    const hasBottom = computed(() => !!slots['bottom'])
    const hasToolBar = computed(() => !!slots['toolBar'])

    // 初始化调用一下，获取搜索参数
    const onInit = () => {
      const params = unref(xSearch)?.onGetFormValues() || {}
      emit('update:value', { ...params, ...(props.showPagination ? state.pages : {}) })
    }

    // 自动计算高度
    useAppHeight(props.autoResize)

    onMounted(() => {
      onInit()
    })

    // 获取scrollTop的高度
    const handleScroll = e => {
      state.scrollTop = e.target.scrollTop
    }
    onActivated(() => {
      const el = unref(xPage)?.querySelector('.x-page__container .x-page__render .scroll')
      if (el && state.scrollTop) {
        el.scrollTop = state.scrollTop
      }
    })

    expose({
      xPage,
      xSearch,
      onScrollTop
    })

    return {
      xPage,
      xSearch,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      ...toRefs(state),
      hasSearchBar,
      hasTop,
      hasBottom,
      hasToolBar,
      spinProps,
      handleQuery,
      handleSearch,
      handleReset,
      handleClear,
      handleScroll,
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

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 10px;
    margin-bottom: 10px;
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

      .ant-pagination {
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
}
</style>
