<template>
  <div class="versions-list">
    <a-row v-if="versionsList.length" v-bind="rowProps">
      <a-col v-for="(item, index) in versionsList" :key="index" v-bind="colProps">
        <slot name="renderItem" :item="item" :index="index" :change="handleChange"></slot>
      </a-col>
    </a-row>
    <template v-else>
      <a-empty :image="simpleImage" :description="emptyText" />
    </template>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import { Empty } from 'ant-design-vue'

export default defineComponent({
  name: 'VersionsList',
  props: {
    versionsList: { type: Array, default: () => [] },
    rowProps: Object,
    colProps: Object,
    emptyText: String
  },
  emits: ['add', 'del'],
  setup(props, { emit }) {
    const handleChange = (bool, row) => {
      if (bool) {
        emit('add', row)
      } else {
        emit('del', row)
      }
    }

    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      handleChange
    }
  }
})
</script>
<style lang="scss" scoped>
.versions-list {
  flex: 1;
  padding: 10px 20px;
  border: 1px solid #c8c7cc;
  margin-left: 15px;
  overflow-y: auto;
}
</style>
