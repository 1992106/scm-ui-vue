<template>
  <a-tabs class="my-tabs" v-model:activeKey="activeKey" size="small" @change="handleChange">
    <a-tab-pane v-for="item in tabs" :tab="item?.label" :key="item?.value">
      <template v-if="item?.value === activeKey">
        <slot></slot>
      </template>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'XTabs',
  inheritAttrs: false,
  props: {
    list: { type: Array, default: () => [] },
    value: String,
    isPermission: { type: Boolean, default: true }
  },
  emits: ['update:value', 'click'],
  setup(props, { emit }) {
    const route = useRoute()

    const state = reactive({
      tabs: [],
      activeKey: ''
    })

    const onInit = () => {
      state.tabs = props.list
      state.activeKey = props.value || route.query?.key || state.tabs[0]?.value
      emit('update:value', state.activeKey)
    }

    const handleChange = $event => {
      emit('update:value', $event)
      emit('click', $event)
      // await router.replace({ query: { key: $event } })
    }

    watch(
      () => props.value,
      val => {
        state.activeKey = val
      }
    )

    onInit()

    return {
      ...toRefs(state),
      handleChange
    }
  }
})
</script>
<style scoped lang="scss">
.my-tabs {
  height: 100%;
  background-color: #f0f2f5;

  &.ant-tabs {
    :deep(.ant-tabs-bar) {
      padding: 5px 10px 10px;
      margin-bottom: 10px;
      background-color: $bg-color;
    }

    :deep(.ant-tabs-content) {
      height: calc(100% - 62px);
      margin-left: 0 !important;

      .ant-tabs-tabpane-inactive {
        display: none;
      }
    }
  }
}
</style>
