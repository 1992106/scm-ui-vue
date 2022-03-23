<template>
  <div class="my-export-pdf">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handleClick">{{ buttonText }}</a-button>
    </template>
    <div ref="pdfRef" class="export-pdf-content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue'
import jsPDF from './jsPDF'
import { isFunction } from 'lodash-es'
import { isPromise } from '@src/utils'

export default defineComponent({
  name: 'XExportPDF',
  props: {
    // 打印按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '导出PDF' },
    buttonProps: { type: Object },
    // PDF配置
    fileName: { type: String, default: '' },
    // 在导出前的回调
    onBefore: { type: Function, default: null }
  },
  emits: ['done'],
  setup(props, { emit }) {
    const pdfRef = ref(null)

    const handleClick = () => {
      let result = null
      if (props.onBefore && isFunction(props.onBefore)) {
        result = props.onBefore()
      }
      if (result && isPromise(result)) {
        result
          .then(() => {
            setTimeout(() => {
              handlePDF()
            }, 200)
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        setTimeout(() => {
          handlePDF()
        })
      }
    }

    const handleDone = () => {
      emit('done')
    }

    const handlePDF = () => {
      jsPDF({
        el: pdfRef.value,
        fileName: props.fileName,
        handleAfter: handleDone
      })
    }

    return {
      pdfRef,
      handleClick
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
