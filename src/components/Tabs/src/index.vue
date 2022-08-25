<template>
  <a-tabs
    v-bind="$attrs"
    v-model:activeKey="activeKey"
    class="x-tabs"
    :type="type"
    :size="size"
    @change="handleChange"
    @edit="handleEdit">
    <a-tab-pane v-for="tab in tabs" :key="tab?.value" :disabled="tab?.disabled" :closable="tab?.closable">
      <template #tab>
        <slot name="tab">
          {{ tab?.label }}
          <span v-if="tab?.count" class="count">({{ tab?.count }})</span>
        </slot>
      </template>
      <template v-if="tab?.value === activeKey">
        <slot></slot>
      </template>
    </a-tab-pane>
    <template #leftExtra>
      <slot name="leftExtra"></slot>
    </template>
    <template #rightExtra>
      <slot name="rightExtra"></slot>
    </template>
    <template #renderTabBar="{ DefaultTabBar, ...props }">
      <slot name="renderTabBar" v-bind="{ DefaultTabBar, ...props }">
        <component :is="DefaultTabBar" v-bind="props" />
      </slot>
    </template>
  </a-tabs>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
import { isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XTabs',
  inheritAttrs: false,
  props: {
    value: [String, Number],
    list: { type: Array, default: () => [] }, // { label: '', value: '', count: '' }
    type: { type: String, default: 'line' },
    size: { type: String, default: 'small' }
  },
  emits: ['update:value', 'change', 'edit'],
  setup(props, { emit, expose }) {
    const state = reactive({
      tabs: [],
      activeKey: ''
    })

    const handleChange = $event => {
      emit('update:value', $event)
      emit('change', $event)
    }

    const handleEdit = (targetKey, action) => {
      emit('edit', targetKey, action)
    }

    const defaultKey = computed(() => {
      // props.value有值，并且在state.tabs中可以找到
      if (!isEmpty(props.value) && state.tabs?.find(val => val?.value === props.value)) {
        return props.value
      }
      return state.tabs?.[0]?.value
    })
    watch(
      () => defaultKey.value,
      val => {
        state.activeKey = val
        emit('update:value', val)
      },
      {
        immediate: true
      }
    )

    watch(
      () => props.list,
      list => {
        state.tabs = list
      },
      {
        immediate: true
      }
    )

    expose({})

    return {
      ...toRefs(state),
      handleChange,
      handleEdit
    }
  }
})
</script>
<style lang="scss" scoped>
.x-tabs {
  height: 100%;
  background-color: #f0f2f5;

  &.ant-tabs {
    :deep(.ant-tabs-nav) {
      padding: 5px 16px 10px;
      margin-bottom: 10px;
      background-color: $bg-color;
    }

    .count {
      margin-left: 5px;
    }

    :deep(.ant-tabs-content-holder) {
      height: calc(100% - 62px);

      .ant-tabs-content {
        height: 100%;
      }
    }
  }
}
</style>
