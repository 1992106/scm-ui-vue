<template>
  <div class="my-page">
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
    <div v-if="hasContent" class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, ref, toRefs } from 'vue'
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
    searchProps: { type: Object, default: () => ({}) }
  },
  emits: ['update:value', 'search', 'reset', 'clear'],
  setup(props, { emit, slots }) {
    const xSearch = ref(null)
    const state = reactive({})

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

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props.searchProps.columns
      return (columns || []).map(col => col.slot).filter(Boolean)
    })

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasExtra = computed(() => !!slots['extra'])
    const hasShortcut = computed(() => !!slots['shortcut'])
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasContent = computed(() => !!slots['content'])

    onMounted(() => {})

    return {
      xSearch,
      ...toRefs(state),
      hasSearchBar,
      hasExtra,
      hasShortcut,
      hasToolBar,
      hasContent,
      getSearchSlots,
      handleSearch,
      handleReset,
      handleClear
    }
  }
})
</script>
<style lang="scss" scoped>
.my-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f0f2f5;

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 10px;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    background-color: #fff;
  }
}
</style>
