<template>
  <div class="x-export">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handleExport">
        {{ buttonText }}
        <template #icon>
          <slot name="icon"></slot>
        </template>
      </a-button>
    </template>
    <div ref="elExport" class="export-content">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import jsPDF from './jsPDF'
import { isFunction } from 'lodash-es'
import { isPromise } from '@src/utils'

export default defineComponent({
  name: 'XExport',
  inheritAttrs: false,
  props: {
    // 导出按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '导出' },
    buttonProps: { type: Object },
    // 导出文件类型
    fileType: { type: String, default: 'pdf' }, // 支持pdf和excel导出
    // 导出文件名
    fileName: { type: String, default: '' },
    // 导出前的回调
    onBefore: { type: Function }
  },
  emits: ['done'],
  setup(props, { emit }) {
    const elExport = ref(null)

    const handleExport = () => {
      let result = null
      if (props.onBefore && isFunction(props.onBefore)) {
        result = props.onBefore()
      }
      if (result && isPromise(result)) {
        result
          .then(() => {
            dispatch()
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        setTimeout(() => {
          dispatch()
        }, 200)
      }
    }

    const handleDone = () => {
      emit('done')
    }

    const dispatch = () => {
      switch (props.fileType) {
        case 'pdf':
          exportPDF()
          break
        case 'excel':
          exportExcel()
          break
        default:
          exportPDF()
      }
    }

    // 导出PDF
    const exportPDF = () => {
      setTimeout(() => {
        jsPDF({
          el: elExport.value,
          fileName: props.fileName,
          handleDone
        })
      }, 200)
    }

    // 导出excel
    const exportExcel = () => {
      // TODO: 待实现
    }

    return {
      elExport,
      handleExport
    }
  }
})
</script>
<style lang="scss" scoped>
.x-export {
  .export-content {
    position: fixed;
    width: 100%;
    top: -9999px;
    left: 9999px;
    background-color: #fff;
    z-index: -9999;
  }
}
</style>
