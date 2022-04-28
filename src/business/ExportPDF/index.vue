<template>
  <div class="my-export-pdf">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handleExport">
        {{ buttonText }}
        <template #icon>
          <slot name="icon"></slot>
        </template>
      </a-button>
    </template>
    <div ref="elExportPDF" class="export-pdf-content">
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
  name: 'XExportPDF',
  inheritAttrs: false,
  props: {
    // 导出按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '导出PDF' },
    buttonProps: { type: Object },
    // PDF文件名
    fileName: { type: String, default: '' },
    // 导出前的回调
    onBefore: { type: Function }
  },
  emits: ['done'],
  setup(props, { emit }) {
    const elExportPDF = ref(null)

    const handleExport = () => {
      let result = null
      if (props.onBefore && isFunction(props.onBefore)) {
        result = props.onBefore()
      }
      if (result && isPromise(result)) {
        result
          .then(() => {
            setTimeout(() => {
              exportPDF()
            }, 200)
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        setTimeout(() => {
          exportPDF()
        })
      }
    }

    const handleDone = () => {
      emit('done')
    }

    const exportPDF = () => {
      jsPDF({
        el: elExportPDF.value,
        fileName: props.fileName,
        handleDone
      })
    }

    return {
      elExportPDF,
      handleExport
    }
  }
})
</script>
<style lang="scss" scoped>
.export-pdf-content {
  position: fixed;
  width: 100%;
  top: -9999px;
  left: 9999px;
  background-color: #fff;
  z-index: -9999;
}
</style>
