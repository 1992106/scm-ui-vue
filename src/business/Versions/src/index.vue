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
        <VersionsList
          :versionsList="versionsList"
          :rowProps="rowProps"
          :colProps="colProps"
          :emptyText="emptyText"
          @add="handleAdd"
          @del="handleDel">
          <template #renderItem="scope">
            <slot name="renderItem" v-bind="scope"></slot>
          </template>
        </VersionsList>
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
import VersionsList from './VersionsList.vue'
import SelectedList from './SelectedList.vue'
import { isFunction, cloneDeep } from 'lodash-es'
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
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '版型库' },
    width: { type: [String, Number], default: '80%' },
    rowKey: { type: String, default: 'id' },
    manual: { type: Boolean, default: false },
    searchProps: { type: Object, default: () => ({}) },
    shortcutProps: { type: Object, default: () => ({}) },
    customRequest: { type: Function, require: true },
    rowProps: { type: Object, default: () => ({ gutter: 24, wrap: true }) },
    colProps: { type: Object, default: () => ({ span: 6 }) },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done'],
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
      cloneList: [],
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
      state.cloneList = []
      state.versionsList = []
      const shortcutParams = xShortcut.value?.onGetFormValues?.()
      const data = await customRequest({
        ...(isEmpty(params) ? {} : params),
        ...(isEmpty(shortcutParams) ? {} : shortcutParams)
      })
      state.spinning = false
      state.cloneList = cloneDeep(data) // 备份数据
      if (state.selectedList.length) {
        state.versionsList = (data || []).map(item => {
          const newItem = state.selectedList.find(val => item?.[props.rowKey] === val?.[props.rowKey])
          return {
            ...item,
            ...(!isEmpty(newItem) ? newItem : {})
          }
        })
      } else {
        state.versionsList = data
      }
    }

    const handleReset = () => {
      xShortcut.value?.onResetFields?.()
    }

    const handleAdd = row => {
      state.selectedList = [...state.selectedList, row]
    }

    const handleDel = row => {
      state.versionsList = state.versionsList.map(item => {
        const newItem = state.cloneList.find(val => row?.[props.rowKey] === val?.[props.rowKey])
        return {
          ...item,
          ...(!isEmpty(newItem) ? newItem : {})
        }
      })
      const index = state.selectedList.findIndex(val => row?.[props.rowKey] === val?.[props.rowKey])
      state.selectedList.splice(index, 1)
    }

    const handleOk = () => {
      emit('done', state.selectedList)
      handleCancel()
    }

    const handleCancel = () => {
      handleReset()
      state.cloneList = []
      state.versionsList = []
      state.selectedList = []
    }

    onMounted(() => {
      if (!props.manual) {
        handleSearch(null)
      }
    })

    return {
      ...toRefs(state),
      xShortcut,
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
  .content {
    display: flex;
    flex: 1;
    padding: 20px 0;
    max-height: 640px;
  }

  .selected-list {
    display: flex;
    flex-direction: column;
    padding: 10px;
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
