<template>
  <div class="versions-list">
    <template v-if="data.length">
      <template v-for="(item, index) in data">
        <slot name="renderItem" :item="item" :index="index"></slot>
      </template>
    </template>
    <template v-else>
      <a-empty :image="simpleImage" :description="emptyText" />
    </template>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { Empty } from 'ant-design-vue'

export default defineComponent({
  name: 'VersionsList',
  props: {
    versionsList: { type: Array, default: () => [] },
    emptyText: String
  },
  emits: ['add'],
  setup(props, { emit }) {
    const state = reactive({
      data: []
    })

    watch(
      () => props.versionsList,
      list => {
        state.data = list
      },
      { deep: true, immediate: true }
    )

    const handleAdd = row => {
      emit('add', row)
    }

    return {
      ...toRefs(state),
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      handleAdd
    }
  }
})
</script>
