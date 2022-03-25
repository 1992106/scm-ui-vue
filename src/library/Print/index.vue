<template>
  <div class="my-print">
    <template v-if="showButton">
      <a-button type="default" v-bind="buttonProps" @click="handleClick">{{ buttonText }}</a-button>
    </template>
    <div style="display: none">
      <div ref="printRef" class="print-dialog">
        <x-qrcode v-if="qrcodeProps" v-bind="qrcodeProps"></x-qrcode>
        <x-barcode v-if="barcodeProps" v-bind="barcodeProps"></x-barcode>
        <div class="print-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import XQrcode from '@library/Qrcode/index.vue'
import XBarcode from '@library/Barcode/index.vue'
import print from './print'
import { isFunction } from 'lodash-es'
import { isPromise } from '@src/utils'

export default defineComponent({
  name: 'XPrint',
  components: {
    'x-qrcode': XQrcode,
    'x-barcode': XBarcode
  },
  props: {
    // 打印按钮
    showButton: { type: Boolean, default: true },
    buttonText: { type: String, default: '打印' },
    buttonProps: { type: Object },
    // 打印配置
    title: { type: String, default: '' },
    // 二维码
    qrcodeProps: { type: Object },
    // 条形码
    barcodeProps: { type: Object },
    // 在打印前的回调
    onBefore: { type: Function, default: null }
  },
  emits: ['done'],
  setup(props, { emit }) {
    const printRef = ref(null)

    const handleClick = () => {
      let result = null
      if (props.onBefore && isFunction(props.onBefore)) {
        result = props.onBefore()
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

    const handleDone = () => {
      emit('done')
    }

    const printf = () => {
      print({
        el: printRef.value,
        title: props.title,
        handleAfter: handleDone
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
.print-dialog {
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
