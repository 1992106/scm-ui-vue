<template>
  <a-layout class="x-layout">
    <a-layout-sider
      theme="light"
      :collapsible="true"
      :collapsed-width="0"
      :zero-width-trigger-style="{ top: '40px' }"
      v-bind="$attrs"
      v-model:collapsed="collapsed"
      :width="width">
      <a-spin v-bind="spinProps">
        <a-menu
          mode="vertical"
          theme="light"
          :multiple="false"
          v-bind="menuProps"
          v-model:openKeys="expandKeys"
          v-model:selectedKeys="selectedKeys"
          @openChange="handleOpen"
          @click="handleClick">
          <!--<a-menu-item v-for="menu in list" :key="menu?.value" :disabled="menu?.disabled">
            {{ menu?.label }}
            <span v-if="menu?.count" class="count">{{ menu?.count }}</span>
          </a-menu-item>-->
          <template v-for="menu in list" :key="menu?.value">
            <template v-if="menu?.children">
              <a-sub-menu :key="menu?.value" :title="menu?.label">
                <a-menu-item
                  v-for="sub in menu.children"
                  :key="sub?.value"
                  :title="sub?.title"
                  :disabled="sub?.disabled">
                  <slot v-if="hasSubMenu" name="subMenu" v-bind="sub">
                    {{ sub?.label }}
                    <span v-if="sub?.count" class="count">{{ sub.count }}</span>
                  </slot>
                </a-menu-item>
              </a-sub-menu>
            </template>
            <template v-else>
              <a-menu-item :key="menu?.value" :title="menu?.title" :disabled="menu?.disabled">
                <slot v-if="hasMenu" name="menu" v-bind="menu">
                  {{ menu?.label }}
                  <span v-if="menu?.count" class="count">{{ menu.count }}</span>
                </slot>
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
  emits: ['update:value', 'update:openKeys', 'menuClick', 'openChange'],
  setup(props, { emit, slots, expose }) {
    // 加载
    const spinProps = computed(() => {
      return typeof props.spinProps === 'object' ? props.spinProps : { spinning: props.spinProps }
    })

    const state = reactive({
      collapsed: false,
      expandKeys: [], // 当前展开的 SubMenu 菜单项 key 数组
      selectedKeys: [] // 当前选中的菜单项 key 数组
    })

    const handleOpen = $event => {
      emit('update:openKeys', $event)
      emit('openChange', $event)
    }

    const handleClick = $event => {
      emit('update:value', $event?.key)
      emit('menuClick', $event)
    }

    const defaultKey = computed(() => {
      const menus = getAllLeafNodes(props.list)
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
      { immediate: true }
    )
    watch(
      () => props.openKeys,
      openKeys => {
        state.expandKeys = openKeys
      },
      { immediate: true }
    )

    const hasMenu = computed(() => !!slots['menu'])
    const hasSubMenu = computed(() => !!slots['subMenu'])

    expose({})

    return {
      ...toRefs(state),
      spinProps,
      hasMenu,
      hasSubMenu,
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
