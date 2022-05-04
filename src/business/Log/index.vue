<template>
  <a-config-provider :locale="zhCn">
    <x-drawer
      v-bind="$attrs"
      v-model:visible="modalVisible"
      :title="title"
      :width="width"
      :spin-props="spinning"
      :footer="null"
      destroy-on-close
      @cancel="handleCancel"
      @ok="handleOk">
      <a-timeline>
        <a-timeline-item v-for="item in data" :key="item?.id">
          <p>{{ formatTime(item?.createAt || item?.createdAt || item?.createTime || item?.createdTime) || '-' }}</p>
          <p>
            {{ item?.createUser || item?.createdUser || '-' }}
            <span style="margin: 0 5px">操作了</span>
            <span style="color: #1890ff" v-html="item?.content"></span>
          </p>
        </a-timeline-item>
      </a-timeline>
    </x-drawer>
  </a-config-provider>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, watch, watchEffect } from 'vue'
import { ConfigProvider, Timeline, TimelineItem } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
import XDrawer from '@components/Drawer'
import { isFunction } from 'lodash-es'
import { formatTime } from '@src/utils'

export default defineComponent({
  name: 'XLog',
  components: {
    'x-drawer': XDrawer,
    'a-config-provider': ConfigProvider,
    'a-timeline': Timeline,
    'a-timeline-item': TimelineItem
  },
  inheritAttrs: false,
  props: {
    title: { type: String, default: '操作日志' },
    width: { type: [String, Number], default: 360 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, require: true },
    showPagination: { type: Boolean, default: false },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 10 }) }
    // paginationConfig: {
    //   type: Object,
    //   default: () => ({
    //     size: 'small',
    //     defaultPageSize: 10,
    //     pageSizeOptions: ['10', '20', '30', '40']
    //   })
    // }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const state = reactive({
      modalVisible: props.visible,
      data: [],
      total: 0,
      spinning: false,
      pages: props.pagination
    })

    watchEffect(() => {
      state.modalVisible = props.visible
      state.pages = props.pagination
    })

    const getLogData = async () => {
      const { customRequest, showPagination } = props
      if (!isFunction(customRequest)) return
      state.spinning = true
      state.data = []
      const data = await customRequest({
        ...(showPagination ? state.pages : {})
      })
      state.spinning = false
      // TODO
      if (showPagination) {
        state.data = data?.list ?? data?.data ?? []
        state.total = data?.total ?? data?.pagination?.total
      } else {
        state.data = data || []
        state.total = (data || []).length
      }
    }

    watch(
      () => props.visible,
      bool => {
        if (bool) {
          getLogData()
        }
      },
      { immediate: true }
    )

    const handleCancel = () => {
      state.modalVisible = false // 使用函数方法调用时，需要手动关闭
      emit('update:visible', false)
    }

    const handleOk = () => {
      handleCancel()
      emit('done')
    }

    return {
      zhCn,
      ...toRefs(state),
      handleOk,
      handleCancel,
      formatTime
    }
  }
})
</script>
