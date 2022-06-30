<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-traceability__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <XTraceability :index="0"></XTraceability>
  </x-drawer>
</template>
<script lang="ts">
import { computed, defineComponent, provide, reactive, toRefs, watch } from 'vue'
import XDrawer from '@packages/components/Drawer'
import XTraceability from './index.vue'
import { isFunction } from 'lodash-es'
// import { getValueByRowKey } from '@packages/components/Table/utils'
import { execRequest } from '@src/utils'
export default defineComponent({
  name: 'XEditTraceability',
  components: {
    XDrawer,
    'x-drawer': XDrawer,
    XTraceability
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '编辑溯源包' },
    width: { type: [String, Number] },
    height: { type: [String, Number] },
    // rowKey: { type: [String, Function], default: 'id' },
    manual: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    // 主表
    customUploadMaster: { type: Function, require: true },
    customDownloadMaster: { type: Function },
    customUpload: { type: Function },
    materialColumns: { type: Array },
    photocopyColumns: { type: Array },
    // 织布
    weavingRowKey: { type: [String, Function], default: 'itemId' },
    weavingColumns: { type: Array, default: () => [] },
    customUploadWeaving: { type: Function },
    customDownloadWeaving: { type: Function },
    // 染整
    dyeingRowKey: { type: [String, Function], default: 'itemId' },
    dyeingColumns: { type: Array },
    customUploadDyeing: { type: Function },
    customDownloadDyeing: { type: Function },
    // 公共
    size: { type: Number, default: 4 },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'done'],
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
      disabled: false,
      traceabilityList: []
    })

    const getDetail = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      await execRequest(customRequest(), {
        success: ({ data }) => {
          state.traceabilityList = [{}]
        },
        fail: () => {
          state.traceabilityList = []
        }
      })
      state.spinning = false
    }

    watch(
      () => props.visible,
      visible => {
        if (visible && !props.manual) {
          getDetail()
        }
      },
      { immediate: true }
    )

    const handleOk = () => {
      emit('done', {})
      modalVisible.value = false
      handleCancel()
    }

    const handleCancel = () => {
      state.traceabilityList = []
    }

    provide('mode', { master: 'action', weaving: 'action', dyeing: 'action' })
    provide('traceabilityList', state.traceabilityList)

    return {
      ...toRefs(state),
      modalVisible,
      getDetail,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss">
.x-traceability__dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
