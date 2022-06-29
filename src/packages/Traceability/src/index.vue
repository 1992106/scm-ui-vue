<template>
  <div class="x-traceability">
    <Master :mode="masterMode" :rowKey="rowKey"></Master>
    <div class="other-info">
      <Weaving :mode="weavingMode" :rowKey="rowKey"></Weaving>
      <div style="width: 20px"></div>
      <Dyeing :mode="dyeingMode" :rowKey="rowKey"></Dyeing>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, inject, provide } from 'vue'
import Master from './Master.vue'
import Weaving from './Weaving.vue'
import Dyeing from './Dyeing.vue'

export default defineComponent({
  name: 'XTraceability',
  components: {
    Master,
    Weaving,
    Dyeing
  },
  props: {
    rowKey: [String, Function],
    index: { type: Number, default: 1 }
  },
  setup(props) {
    const useMode = inject('mode')
    const useTraceabilityList = inject('traceabilityList')

    const traceabilityData = computed(() => useTraceabilityList[props.index])

    provide('traceabilityData', traceabilityData)

    return {
      masterMode: useMode['master'],
      weavingMode: useMode['weaving'],
      dyeingMode: useMode['dyeing']
    }
  }
})
</script>
<style lang="scss" scoped>
.x-traceability {
  .other-info {
    @include flex-row;

    justify-content: space-around;
    margin-top: 10px;

    :deep(.ant-form) {
      .ant-form-item {
        margin-bottom: 0;
      }
    }

    .weaving-info {
      width: 55%;
    }

    .dyeing-info {
      width: 45%;
    }
  }

  :deep(.required) {
    color: red;
  }

  :deep(.title) {
    margin-bottom: 10px;

    .tips {
      color: #999;
    }
  }
}
</style>
