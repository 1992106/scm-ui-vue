<template>
  <a-layout class="x-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      theme="light"
      v-bind="$attrs"
      collapsible
      :collapsed-width="0"
      :zero-width-trigger-style="{ top: '40px' }"
      :width="width">
      <a-spin v-bind="spinProps">
        <a-menu
          v-model:openKeys="expandKeys"
          v-model:selectedKeys="selectedKeys"
          mode="vertical"
          theme="light"
          v-bind="menuProps"
          @openChange="handleOpen"
          @click="handleClick">
          <!--<a-menu-item v-for="menu in menus" :key="menu?.value" :disabled="menu?.disabled">
            {{ menu?.label }}
            <span v-if="menu?.count" class="count">{{ menu?.count }}</span>
          </a-menu-item>-->
          <template v-for="menu in menus" :key="menu?.value">
            <template v-if="menu?.children">
              <a-sub-menu :key="menu?.value" :title="menu?.label">
                <a-menu-item v-for="sub in menu.children" :key="sub?.value" :disabled="sub?.disabled">
                  {{ sub?.label }}
                  <span v-if="sub?.count" class="count">{{ sub?.count }}</span>
                </a-menu-item>
              </a-sub-menu>
            </template>
            <template v-else>
              <a-menu-item :key="menu?.value" :disabled="menu?.disabled">
                {{ menu?.label }}
                <span v-if="menu?.count" class="count">{{ menu?.count }}</span>
              </a-menu-item>
            </template>
          </template>
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
import { getAllLeafNodes, isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XLayout',
  inheritAttrs: false,
  props: {
    value: [String, Number],
    openKeys: { type: Array, default: () => [] },
    list: { type: Array, default: () => [] }, // { label: '', value: '', count: '' }
    width: { type: [String, Number], default: 160 },
    menuProps: { type: Object, default: () => ({}) },
    spinProps: { type: [Boolean, Object], default: false }
  },
  emits: ['update:value', 'click', 'update:openKeys', 'openChange'],
  setup(props, { emit, expose }) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    const state = reactive({
      collapsed: false,
      menus: [],
      expandKeys: [], // 当前展开的 SubMenu 菜单项 key 数组
      selectedKeys: [] // 当前选中的菜单项 key 数组
    })

    const handleOpen = $event => {
      emit('update:openKeys', $event)
      emit('openChange', $event)
    }

    const handleClick = $event => {
      emit('update:value', $event?.key)
      emit('click', $event)
    }

    const defaultKey = computed(() => {
      let menus = state.menus
      // 如果openKeys不为空，则说明是树结构
      if (!isEmpty(props.openKeys)) {
        menus = getAllLeafNodes(state.menus)
      }
      // props.value有值，并且在state.menus中可以找到
      if (!isEmpty(props.value) && menus?.find(val => val?.value === props.value)) {
        return props.value
      }
      return menus?.[0]?.value
    })
    watch(
      () => defaultKey.value,
      val => {
        state.selectedKeys = val ? [val] : []
        emit('update:value', val)
      },
      {
        immediate: true
      }
    )
    watch(
      () => props.openKeys,
      openKeys => {
        state.expandKeys = openKeys
      },
      {
        immediate: true
      }
    )
    watch(
      () => props.list,
      list => {
        state.menus = list
      },
      {
        immediate: true
      }
    )

    expose({})

    return {
      ...toRefs(state),
      spinProps,
      handleOpen,
      handleClick
    }
  }
})
</script>
<style lang="scss" scoped>
.x-layout {
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

    .ant-menu-vertical,
    .ant-menu-inline {
      height: 100%;
      border-right: none;
      overflow-y: auto;
      overflow-x: hidden;
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
  }
}
</style>
