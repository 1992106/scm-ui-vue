<template>
  <div class="versions-list">
    <a-row v-if="data.length" :gutter="16" wrap v-bind="rowProps">
      <a-col v-for="(item, index) in data" :key="index" :span="6" v-bind="colProps">
        <slot name="renderItem" :item="item" :index="index"></slot>
      </a-col>
    </a-row>
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
    rowProps: Object,
    colProps: Object,
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
        state.data = [
          ...list,
          { checked: false },
          { checked: false },
          { checked: false },
          { checked: false },
          { checked: false },
          { checked: false },
          { checked: false }
        ]
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
<style lang="scss" scoped>
.versions-list {
  flex: 1;
  padding: 10px;
  border: 1px solid #c8c7cc;
  margin-left: 15px;
}
</style>
