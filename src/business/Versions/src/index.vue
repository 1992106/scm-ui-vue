<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-versions-dialog"
    :title="title"
    :width="width"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <div class="x-versions">
      <x-search ref="xSearch" v-bind="searchProps" @search="handleSearch" @reset="handleReset">
        <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
      </x-search>
      <div class="content">
        <Shortcut ref="xShortcut" v-bind="shortcutProps"></Shortcut>
        <VersionList
          v-model:pagination="pages"
          :versionList="versionList"
          :rowProps="rowProps"
          :colProps="colProps"
          :total="total"
          :emptyText="emptyText"
          @search="handleSearch"
          @add="handleAdd"
          @del="handleDel">
          <template #renderItem="scope">
            <slot name="renderItem" v-bind="scope"></slot>
          </template>
        </VersionList>
      </div>
      <div class="selected-list">
        <div class="total">已选中{{ selectedList.length }}条</div>
        <SelectedList
          :rowKey="rowKey"
          :selectedList="selectedList"
          :emptyText="emptyText"
          @del="handleDel"></SelectedList>
      </div>
    </div>
  </x-modal>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, toRefs } from 'vue'
import XModal from '@components/Modal'
import XSearch from '@components/Search/index.vue'
import Shortcut from './Shortcut.vue'
import VersionList from './VersionList.vue'
import SelectedList from './SelectedList.vue'
import { isFunction, cloneDeep } from 'lodash-es'
import { isEmpty } from '@src/utils'
import { transformRowKey } from '@components/Table/utils'

export default defineComponent({
  name: 'XVersions',
  components: {
    'x-modal': XModal,
    'x-search': XSearch,
    Shortcut,
    VersionList,
    SelectedList
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '版型库' },
    width: { type: [String, Number], default: '80%' },
    rowKey: { type: [String, Function], default: 'id' },
    manual: { type: Boolean, default: false },
    searchProps: { type: Object, default: () => ({}) },
    shortcutProps: { type: Object, default: () => ({}) },
    customRequest: { type: Function, require: true },
    rowProps: { type: Object, default: () => ({ gutter: 24, wrap: true }) },
    colProps: { type: Object, default: () => ({ span: 6 }) },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done', 'search', 'reset'],
  setup(props, { emit }) {
    const xShortcut = ref(null)
    const modalVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      searchParams: {},
      pages: { page: 1, pageSize: 20 },
      total: 0,
      cloneList: [],
      versionList: [],
      selectedList: []
    })

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props.searchProps?.columns || []
      return (columns || []).map(col => col.slot).filter(Boolean)
    })

    const handleSearch = async params => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      // 初始化和分页时参数为空
      if (params) {
        state.searchParams = params
      }
      state.spinning = true
      state.cloneList = []
      state.versionList = []
      const shortcutParams = xShortcut.value?.onGetFormValues?.()
      const data = await customRequest({
        ...(isEmpty(state.searchParams) ? {} : state.searchParams),
        ...state.pages,
        ...(isEmpty(shortcutParams) ? {} : shortcutParams)
      })
      state.spinning = false
      const list = data?.data ?? data?.list ?? []
      state.cloneList = cloneDeep(list) // 备份数据
      if (state.selectedList.length) {
        state.versionList = (list || []).map(item => {
          const newItem = state.selectedList.find(val => {
            return transformRowKey(props.rowKey, item) === transformRowKey(props.rowKey, val)
          })
          return {
            ...item,
            ...(!isEmpty(newItem) ? newItem : {})
          }
        })
      } else {
        state.versionList = list
      }
      state.total = data?.total || 0
      emit('search', state.versionList)
    }

    const handleReset = () => {
      state.searchParams = {}
      state.pages = { page: 1, pageSize: 20 }
      xShortcut.value?.onResetFields?.()
      emit('reset')
    }

    const handleAdd = row => {
      state.selectedList = [...state.selectedList, row]
    }

    const handleDel = row => {
      const newItem = state.cloneList.find(val => {
        return transformRowKey(props.rowKey, row) === transformRowKey(props.rowKey, val)
      })
      state.versionList = state.versionList.map(item => {
        return {
          ...item,
          ...(!isEmpty(newItem) && transformRowKey(props.rowKey, newItem) === transformRowKey(props.rowKey, item)
            ? newItem
            : {})
        }
      })
      const index = state.selectedList.find(val => {
        return transformRowKey(props.rowKey, row) === transformRowKey(props.rowKey, val)
      })
      state.selectedList.splice(index, 1)
    }

    const handleOk = () => {
      emit('done', state.selectedList)
      modalVisible.value = false
      handleCancel()
    }

    const handleCancel = () => {
      handleReset()
      state.cloneList = []
      state.versionList = []
      state.selectedList = []
    }

    onMounted(() => {
      if (!props.manual) {
        handleSearch(null)
      }
    })

    return {
      xShortcut,
      ...toRefs(state),
      modalVisible,
      getSearchSlots,
      handleSearch,
      handleReset,
      handleAdd,
      handleDel,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style scoped lang="scss">
.x-versions {
  .x-search {
    padding-top: 0;
  }

  .content {
    display: flex;
    flex: 1;
    padding: 16px 0;
    max-height: 640px;
  }

  .selected-list {
    display: flex;
    flex-direction: column;
    padding: 10px 16px 16px;
    border: 1px solid #c8c7cc;

    .total {
      margin-bottom: 6px;
    }
  }
}
</style>
<style lang="scss">
.x-versions-dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
