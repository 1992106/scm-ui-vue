<template>
  <template v-if="!menuInfo?.meta?.hidden">
    <a-sub-menu v-if="menuInfo.children?.length" :key="menuInfo.name" v-bind="$attrs">
      <template #:title>
        <span>
          <icon-font v-if="menuInfo.meta?.icon" :type="menuInfo.meta.icon" />
          <span>{{ menuInfo.meta?.title }}</span>
        </span>
      </template>
      <template v-for="item in menuInfo.children">
        <template v-if="!item.children">
          <a-menu-item :key="item.name" v-if="!item?.meta?.hidden">
            <icon-font v-if="item.meta?.icon" :type="item.meta.icon" />
            <span>{{ item.meta?.title }}</span>
          </a-menu-item>
        </template>
        <template v-else>
          <MyMenuItem :menu-info="item" :key="item.name" />
        </template>
      </template>
    </a-sub-menu>
    <a-menu-item v-else :key="menuInfo.name">
      <icon-font v-if="menuInfo.meta?.icon" :type="menuInfo.meta.icon" />
      <span>{{ menuInfo.meta?.title }}</span>
    </a-menu-item>
  </template>
</template>
<script>
import { defineComponent } from 'vue'
import IconFont from '@components/IconFont'

export default defineComponent({
  name: 'MyMenuItem',
  components: {
    IconFont
  },
  props: {
    menuInfo: {
      type: Object,
      default: () => ({})
    }
  }
})
</script>
