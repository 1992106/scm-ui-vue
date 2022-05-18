<template>
  <a-popover
    v-model:visible="popoverVisible"
    :title="title"
    overlayClassName="x-downloads"
    placement="bottomRight"
    trigger="click">
    <template #content>
      <DownloadList
        :data="data"
        :rowKey="rowKey"
        :width="width"
        :height="height"
        :customDownload="customDownload"
        :customCancel="customCancel"
        :empty-text="emptyText" />
    </template>
    <a-button shape="circle">
      <template #icon>
        <CloudDownloadOutlined />
      </template>
    </a-button>
  </a-popover>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
import { Popover } from 'ant-design-vue'
import { CloudDownloadOutlined } from '@ant-design/icons-vue'
import DownloadList from './DownloadList.vue'
import { isFunction } from 'lodash-es'

export default defineComponent({
  name: 'XDownloads',
  components: {
    'a-popover': Popover,
    CloudDownloadOutlined,
    DownloadList
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '下载中心' },
    width: { type: [String, Number], default: 360 },
    height: { type: [String, Number], default: '300' },
    rowKey: { type: [String, Function], default: 'id' },
    customRequest: { type: Function, require: true },
    customDownload: { type: Function },
    customCancel: { type: Function },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['update:visible', 'toggle'],
  setup(props, { emit }) {
    const popoverVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
        emit('toggle', val)
      }
    })

    const state = reactive({
      spinning: false,
      data: [],
      total: 0
    })

    watch(
      () => props.visible,
      visible => {
        if (visible) {
          handleRequest()
        }
      },
      { immediate: true }
    )

    const handleRequest = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      const [err, data] = await customRequest()
      state.spinning = false
      if (err) {
        state.data = []
        state.total = 0
        return
      }
      state.data = data || []
      state.total = (data || []).length
    }

    return {
      ...toRefs(state),
      popoverVisible
    }
  }
})
</script>
<style scoped lang="scss">
.x-downloads {
}
</style>
