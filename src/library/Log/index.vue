<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="logVisible"
    :title="title"
    :width="width"
    destroyOnClose
    :afterVisibleChange="handleClose"
  >
    <a-spin :spinning="spinning">
      <a-timeline>
        <a-timeline-item v-for="item in data" :key="item?.id">
          <p>{{ item?.createdTime || '-' }}</p>
          <p>
            {{ item?.createdUser || '-' }}
            <span style="margin: 0 5px">操作了</span>
            <span style="color: #1890ff" v-html="item?.content"></span>
          </p>
        </a-timeline-item>
      </a-timeline>
    </a-spin>
  </x-drawer>
</template>
<script>
import { defineComponent, computed, reactive, toRefs } from 'vue'
import XDrawer from '@components/Drawer'
import { isFunction } from 'lodash-es'

export default defineComponent({
  name: 'XLog',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '操作日志' },
    width: { type: Number, default: 360 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true } // [{createdUser: '', createdUser: '', content: ''}]
  },
  emits: ['update:visible', 'done'],
  components: {
    'x-drawer': XDrawer
  },
  setup(props, { emit }) {
    const state = reactive({
      data: [],
      spinning: false
    })
    const logVisible = computed({
      get: () => {
        if (props.visible) {
          getLogData()
        }
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const handleClose = visible => {
      if (!visible) {
        emit('done', false)
      }
    }

    const getLogData = async () => {
      const { customRequest } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      const res = await customRequest()
      state.spinning = false
      state.data = res?.data || []
    }

    return {
      ...toRefs(state),
      logVisible,
      handleClose
    }
  }
})
</script>
