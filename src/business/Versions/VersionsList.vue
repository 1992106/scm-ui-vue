<template>
  <div class="versions-list">
    <template v-if="data.length">
      <template v-for="(item, index) in data">
        <slot name="renderItem" :item="item" :index="index"></slot>
      </template>
    </template>
    <template v-else>
      <div>{{ emptyText }}</div>
    </template>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'

export default defineComponent({
  name: 'VersionsList',
  props: {
    versionsList: { type: Array, default: () => [] }
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
      handleAdd
    }
  }
})
</script>
