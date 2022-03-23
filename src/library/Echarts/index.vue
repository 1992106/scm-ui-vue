<template>
  <div ref="echartsRef" class="my-echarts"></div>
</template>
<script>
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core'
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components'
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'

export default defineComponent({
  name: 'XEcharts',
  props: {
    options: { type: Object },
    components: { type: Array },
    width: { type: Number },
    height: { type: Number, default: 500 },
    theme: { type: String }
  },
  emits: ['done'],
  setup(props) {
    const echartsRef = ref(null)

    // 注册必须的组件
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      DatasetComponent,
      TransformComponent,
      LegendComponent,
      LabelLayout,
      UniversalTransition,
      CanvasRenderer,
      // 图表组件
      props.components
    ])

    const initEcharts = () => {
      const instance = echarts?.getInstanceByDom(echartsRef.value)
      if (instance) {
        echartsRef.value = instance
      } else {
        const opts = {
          width: props.width,
          height: props.height
        }
        echartsRef.value = echarts.init(echartsRef.value, props.theme || null, opts)
      }
      echartsRef.value?.setOption(props.options)
    }

    const handleResize = () => {
      echartsRef.value?.resize()
    }

    onMounted(() => {
      initEcharts()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      echartsRef
    }
  }
})
</script>
