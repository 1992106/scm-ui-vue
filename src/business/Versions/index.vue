<template>
  <x-modal
    v-model:visible="materialVisible"
    :title="title"
    :width="width"
    :height="height"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <div class="my-materials">
      <x-search
        ref="xSearch"
        show-expand
        layout="horizontal"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
        v-bind="searchProps"
        @search="handleSearch"
        @reset="handleReset">
        <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
      </x-search>
      <div class="content">
        <Shortcut v-bind="shortcutProps" @shortcut="handleShortcut"></Shortcut>
        <VersionsList :versionsList="versionsList" :emptyText="emptyText" @add="handleAdd">
          <template #renderItem="scope">
            <slot name="renderItem" v-bind="scope"></slot>
          </template>
        </VersionsList>
      </div>
      <div class="selected-list">
        已选中{{ selectedList.length }}条
        <SelectedList v-bind="tableProps" v-model:selectedList="selectedList" @del="handleDel"></SelectedList>
      </div>
    </div>
  </x-modal>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue'
import XModal from '@components/Modal'
import XSearch from '@components/Search/index.vue'
import Shortcut from './Shortcut.vue'
import VersionsList from './VersionsList.vue'
import SelectedList from './SelectedList.vue'
import { isFunction } from 'lodash-es'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XVersions',
  components: {
    'x-modal': XModal,
    'x-search': XSearch,
    Shortcut,
    VersionsList,
    SelectedList
  },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '版型库' },
    width: { type: [String, Number], default: '80%' },
    height: { type: [String, Number], default: 'calc(100% - 100px)' },
    searchProps: { type: Object, default: () => ({}) },
    shortcutProps: { type: Object, default: () => ({}) },
    tableProps: { type: Object, default: () => ({}) },
    customRequest: { type: Function, require: true },
    emptyText: { type: String, default: '暂无数据' },
    manual: { type: Boolean, default: false }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const materialVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      shortcutParams: {},
      versionsList: [],
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
      state.spinning = true
      state.versionsList = []
      const data = await customRequest({
        ...(isEmpty(params) ? {} : params),
        ...(isEmpty(state.shortcutParams) ? {} : state.shortcutParams)
      })
      state.spinning = false
      state.versionsList = data.map(val => ({ ...val, checked: false }))
    }

    const handleShortcut = params => {
      state.shortcutParams = params
    }

    const handleReset = () => {
      state.shortcutParams = {}
    }

    const handleAdd = row => {
      state.selectedList = [...state.selectedList, row]
    }

    const handleDel = row => {
      state.versionsList = state.versionsList.map(val => {
        return row?.id === val?.id ? { ...val, checked: false } : val
      })
    }

    const handleOk = () => {
      emit('done', state.selectedList)
      handleCancel()
    }

    const handleCancel = () => {
      handleReset()
      state.versionsList = []
      state.selectedList = []
      materialVisible.value = false
    }

    return {
      ...toRefs(state),
      materialVisible,
      getSearchSlots,
      handleSearch,
      handleShortcut,
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
.my-materials {
  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px 0;

    .versions-list {
      margin-left: 15px;
    }
  }

  .selected-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    border: 1px solid #c8c7cc;
    padding: 10px;
  }
}
</style>
