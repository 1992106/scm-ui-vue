<template>
  <div class="x-tabs">
    <a-tabs
      v-bind="$attrs"
      v-model:activeKey="activeKey"
      :type="type"
      :size="size"
      @change="handleChange"
      @edit="handleEdit">
      <a-tab-pane v-for="tab in list" :key="tab.value" :disabled="tab?.disabled" :closable="tab?.closable">
        <template #closeIcon>
          <slot name="closeIcon"></slot>
        </template>
        <template #tab>
          <slot name="tab">
            {{ tab?.label }}
            <span v-if="tab?.count" class="count">({{ tab.count }})</span>
          </slot>
        </template>
      </a-tab-pane>
      <template #addIcon>
        <slot name="addIcon"></slot>
      </template>
      <template #moreIcon>
        <slot name="moreIcon"></slot>
      </template>
      <template v-if="hasLeftExtra" #leftExtra>
        <slot name="leftExtra"></slot>
      </template>
      <template v-if="hasRightExtra" #rightExtra>
        <slot name="rightExtra"></slot>
      </template>
      <template v-if="hasRenderTabBar" #renderTabBar="{ DefaultTabBar, ...props }">
        <slot name="renderTabBar" v-bind="{ DefaultTabBar, ...props }"></slot>
      </template>
    </a-tabs>
    <div class="x-tabs__container">
      <slot></slot>
    </div>
  </div>
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
    // 标签页大小 large | middle | small
    size: {
      validator(value) {
        return ['large', 'middle', 'small'].includes(value)
      },
      default: 'small'
    }
  },
  emits: ['update:value', 'change', 'edit'],
  setup(props, { emit, slots, expose }) {
    const state = reactive({
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
      if (!isEmpty(props.value) && props.list?.find(val => val?.value === props.value)) {
        return props.value
      }
      return props.list?.[0]?.value
    })
    watch(
      () => defaultKey.value,
      val => {
        state.activeKey = val
        emit('update:value', val)
      },
      { immediate: true }
    )

    // 是否显示插槽
    const hasLeftExtra = computed(() => !!slots['leftExtra'])
    const hasRightExtra = computed(() => !!slots['rightExtra'])
    const hasRenderTabBar = computed(() => !!slots['renderTabBar'])

    expose({})

    return {
      ...toRefs(state),
      handleChange,
      handleEdit,
      hasLeftExtra,
      hasRightExtra,
      hasRenderTabBar
    }
  }
})
</script>
<style lang="scss" scoped>
.x-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f0f2f5;

  & > .ant-tabs {
    :deep(.ant-tabs-nav) {
      padding: 5px 16px 10px;
      margin-bottom: 10px;
      background-color: $bg-color;
    }

    .count {
      margin-left: 5px;
    }
  }

  &__container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #fff;
  }
}
</style>
