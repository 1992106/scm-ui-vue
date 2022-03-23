<template>
  <a-layout class="my-page">
    <a-layout-sider
      collapsible
      :collapsedWidth="0"
      :zeroWidthTriggerStyle="{ top: '40px' }"
      :width="160"
      theme="light"
      v-model:collapsed="collapsed"
    >
      <a-spin v-bind="spinProps">
        <a-menu v-model:selectedKeys="selectedKeys" @click="handleClick">
          <a-menu-item v-for="item in menus" :key="item.value">
            {{ item.label }}
            <span class="count" v-if="item.count">{{ item.count }}</span>
          </a-menu-item>
        </a-menu>
      </a-spin>
    </a-layout-sider>
    <a-layout-content>
      <slot></slot>
    </a-layout-content>
  </a-layout>
</template>
<script>
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
export default defineComponent({
  name: 'XLayout',
  inheritAttrs: false,
  props: {
    list: { type: Array, default: () => [] }, // { label: '', value: '', count: '' }
    value: String,
    spinProps: { type: [Boolean, Object], default: false }
  },
  emits: ['update:value', 'click'],
  setup(props, { emit }) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    const state = reactive({
      collapsed: false,
      menus: [],
      selectedKeys: []
    })

    const onInit = () => {
      state.menus = props.list
      const defaultKey = props.value || state.menus[0]?.value
      state.selectedKeys = defaultKey ? [defaultKey] : []
      emit('update:value', defaultKey)
    }

    const handleClick = $event => {
      emit('update:value', $event?.key)
      emit('click', $event)
    }

    watch(
      () => props.value,
      val => {
        state.selectedKeys = [val]
      }
    )

    onInit()

    return {
      ...toRefs(state),
      spinProps,
      handleClick
    }
  }
})
</script>
<style lang="scss" scoped>
.my-page {
  height: calc(100% + 32px);
  background-color: #f0f2f5;
  margin: -16px;

  .ant-layout-sider {
    :deep(.ant-layout-sider-zero-width-trigger) {
      z-index: 99;
      box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
      color: $color-base;
    }

    .ant-spin-nested-loading {
      height: 100%;

      :deep(.ant-spin-container) {
        height: 100%;
        overflow: hidden;
      }
    }

    .ant-menu-vertical {
      height: 100%;
      border-right: none;
      overflow-y: auto;
      padding: 10px 0;

      .count {
        float: right;
      }

      :deep(.ant-menu-item) {
        height: 36px;
        line-height: 36px;
      }
    }
  }

  .ant-layout-content {
    padding: 10px;

    :deep(.vxe-grid--toolbar-wrapper) {
      .vxe-toolbar {
        padding: 0 10px;
      }
    }
  }
}
</style>
