<template>
  <div>Example</div>
</template>
<script lang="ts">
import { defineComponent, onActivated, onMounted, onUnmounted } from 'vue'
export default defineComponent({
  name: 'Example',
  components: {},
  setup() {
    onMounted(() => {
      console.log('onMounted', 'Example组件')
    })
    onActivated(() => {
      console.log('onActivated', 'Example组件')
    })
    onUnmounted(() => {
      console.log('onUnmounted', 'Example组件')
    })

    return {}
  }
})
</script>
<style lang="scss" scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .info {
    width: 100%;
    margin-top: 10px;

    .line {
      display: flex;
      justify-content: space-between;
    }
  }

  .ant-checkbox-wrapper {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
  }
}
</style>
