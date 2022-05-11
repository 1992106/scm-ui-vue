<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-materials-dialog"
    :title="title"
    :width="width"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <div class="x-materials">
      <x-search ref="xSearch" v-bind="searchProps" @search="handleSearch" @reset="handleReset">
        <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
      </x-search>
      <div class="material-list">
        <div class="title">全部</div>
        <MaterialList
          v-model:pagination="pages"
          :rowKey="rowKey"
          :materialList="materialList"
          :total="total"
          :selectedType="selectedType"
          :emptyText="emptyText"
          @search="handleSearch"
          @add="handleAdd"
          @del="handleDel"></MaterialList>
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
import { computed, defineComponent, onMounted, reactive, toRefs } from 'vue'
import XModal from '@components/Modal'
import XSearch from '@components/Search/index.vue'
import MaterialList from './MaterialList.vue'
import SelectedList from './SelectedList.vue'
import { isFunction, cloneDeep } from 'lodash-es'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XMaterials',
  components: {
    'x-modal': XModal,
    'x-search': XSearch,
    MaterialList,
    SelectedList
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '版型档案' },
    width: { type: [String, Number], default: '80%' },
    rowKey: { type: String, default: 'supplierMaterialId' },
    manual: { type: Boolean, default: false },
    searchProps: { type: Object, default: () => ({}) },
    customRequest: { type: Function, require: true },
    selectedType: { type: String, default: 'checkbox' }, // 选择模式：checkbox 多选和 radio 单选
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done', 'search', 'reset'],
  setup(props, { emit }) {
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
      materialList: [],
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
      // 初始化和分页搜索时参数为空
      if (params) {
        state.searchParams = params
      }
      state.spinning = true
      state.cloneList = []
      state.materialList = []
      const data = await customRequest({
        ...(isEmpty(state.searchParams) ? {} : state.searchParams),
        ...state.pages
      })
      state.spinning = false
      const list = data?.data ?? data?.list ?? []
      state.cloneList = cloneDeep(list) // 备份数据
      if (state.selectedList.length) {
        state.materialList = (list || []).map(item => {
          const newItem = state.selectedList.find(val => item?.[props.rowKey] === val?.[props.rowKey])
          return {
            ...item,
            ...(!isEmpty(newItem) ? newItem : {})
          }
        })
      } else {
        state.materialList = list
      }
      state.total = data?.total || 0
      emit('search', state.materialList)
    }

    const handleReset = () => {
      state.searchParams = {}
      state.pages = { page: 1, pageSize: 20 }
      emit('reset')
    }

    const handleAdd = row => {
      state.selectedList = [...state.selectedList, row]
    }

    const handleDel = row => {
      const newItem = state.cloneList.find(val => row?.[props.rowKey] === val?.[props.rowKey])
      state.materialList = state.materialList.map(item => {
        return {
          ...item,
          ...(!isEmpty(newItem) && newItem?.[props.rowKey] === item?.[props.rowKey] ? newItem : {})
        }
      })
      const index = state.selectedList.findIndex(val => row?.[props.rowKey] === val?.[props.rowKey])
      state.selectedList.splice(index, 1)
    }

    const handleOk = () => {
      modalVisible.value = false
      handleCancel()
      emit('done', state.selectedList)
    }

    const handleCancel = () => {
      handleReset()
      state.cloneList = []
      state.materialList = []
      state.selectedList = []
    }

    onMounted(() => {
      if (!props.manual) {
        handleSearch(null)
      }
    })

    return {
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
.x-materials {
  .x-search {
    padding-top: 0;
  }

  .material-list,
  .selected-list {
    display: flex;
    flex-direction: column;
    padding: 10px 16px 16px;
    border: 1px solid #c8c7cc;
    margin-top: 16px;

    .title,
    .total {
      margin-bottom: 6px;
    }
  }
}
</style>
<style lang="scss">
.x-materials-dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
