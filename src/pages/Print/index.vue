<template>
  <div class="mrp-print-wrap">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handleClick">{{ buttonText }}</a-button>
    </template>
    <div style="display: none">
      <div class="mrp-print" ref="printRef">
        <QRCode v-if="qrcodeProps" v-bind="qrcodeProps"></QRCode>
        <Barcode v-if="barcodeProps" v-bind="barcodeProps"></Barcode>
        <div class="print-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue'
import print from './print'
import { isFunction } from 'lodash-es'
import { isPromise } from '@src/utils'

export default defineComponent({
  name: 'Print',
  props: {
    // 打印按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '打印' },
    buttonProps: { type: Object },
    // 打印配置
    title: { type: String, default: '' },
    importCss: { type: Boolean, default: true },
    importStyle: { type: Boolean, default: true },
    loadCss: { type: Array, default: () => [] },
    delay: { type: Number, default: 300 },
    beforePrintHandle: { type: Function, default: null },
    afterPrintHandle: { type: Function, default: null },
    // 二维码
    qrcodeProps: { type: Object },
    // 条形码
    barcodeProps: { type: Object },
    // 在打印前的回调
    onPrintBefore: { type: Function, default: null }
  },
  setup(props) {
    const printRef = ref(null)

    const handleClick = () => {
      let result = null
      if (props.onPrintBefore && isFunction(props.onPrintBefore)) {
        result = props.onPrintBefore()
      }
      if (result && isPromise(result)) {
        result
          .then(() => {
            setTimeout(() => {
              printf()
            }, 200)
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        setTimeout(() => {
          printf()
        })
      }
    }

    const printf = () => {
      print({
        el: printRef.value,
        title: props.title,
        importCss: props.importCss,
        importStyle: props.importStyle,
        loadCss: props.loadCss,
        delay: props.delay,
        beforePrintHandle: props.beforePrintHandle,
        afterPrintHandle: props.afterPrintHandle,
        debug: false
      })
    }

    return {
      printRef,
      handleClick
    }
  }
})
</script>
<style lang="scss" scoped>
.mrp-print {
  display: flex;
  & > div:first-of-type {
    margin-right: 10px;
  }
  .print-content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}
</style>
