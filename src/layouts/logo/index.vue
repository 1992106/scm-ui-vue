<template>
  <div class="logo">
    <img src="../../assets/logo.png" alt="" />
    <h2 v-show="!collapsed" class="title">{{ title }}</h2>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import setting from '@src/config'

export default defineComponent({
  name: 'AppLogo',
  props: {
    collapsed: {
      type: Boolean
    }
  },
  setup() {
    return {
      title: setting.title
    }
  }
})
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: $header-height;
  line-height: $header-height;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  z-index: 3;
  background: $bg-color;

  img {
    height: 32px;
  }

  .title {
    margin-bottom: 0;
  }
}
</style>
