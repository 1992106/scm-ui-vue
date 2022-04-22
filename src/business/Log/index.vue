<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    :title="title"
    :width="width"
    :spin-props="spinning"
    :footer="null"
    destroy-on-close
    @cancel="handleCancel">
    <a-timeline>
      <a-timeline-item v-for="item in data" :key="item?.id">
        <p>{{ formatTime(item?.createAt || item?.createdTime) || '-' }}</p>
        <p>
          {{ item?.createUser || item?.createdUser || '-' }}
          <span style="margin: 0 5px">操作了</span>
          <span style="color: #1890ff" v-html="item?.content"></span>
        </p>
      </a-timeline-item>
    </a-timeline>
  </x-drawer>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect } from 'vue'
import { Timeline, TimelineItem } from 'ant-design-vue'
import XDrawer from '@components/Drawer'
import { isFunction } from 'lodash-es'
import { formatTime } from '@src/utils'

export default defineComponent({
  name: 'XLog',
  components: {
    'x-drawer': XDrawer,
    'a-timeline': Timeline,
    'a-timeline-item': TimelineItem
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '操作日志' },
    width: { type: [String, Number], default: 360 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const state = reactive({
      modalVisible: props.visible,
      data: [],
      spinning: false
    })

    const getLogData = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      state.data = []
      const data = await customRequest()
      state.spinning = false
      state.data = data || []
    }

    watchEffect(() => {
      if (props.visible) {
        getLogData()
      }
      state.modalVisible = props.visible
    })

    const handleCancel = () => {
      state.modalVisible = false
      emit('update:visible', false)
      emit('done')
    }

    return {
      ...toRefs(state),
      handleCancel,
      formatTime
    }
  }
})
</script>
