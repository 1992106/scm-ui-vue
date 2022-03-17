<template>
  <img ref="barcode" alt="条形码" />
  <p v-if="displayValue" style="text-align: center; font-size: 20px; margin-top: -6px; color: #000">
    {{ text || codeValue }}
  </p>
</template>

<script>
import JsBarcode from 'jsbarcode'
import { nextTick, watch, ref, defineComponent } from 'vue'
export default defineComponent({
  name: 'Barcode',
  props: {
    codeValue: { type: String, require: true },
    format: { type: String, default: 'CODE128' },
    width: { type: Number, default: 2 },
    height: { type: Number, default: 40 },
    text: { type: String },
    lineColor: { type: String, default: '#000' },
    displayValue: { type: Boolean, default: true }
  },
  setup(props) {
    const barcode = ref(null)
    const getBarCode = () => {
      JsBarcode(barcode.value, props.codeValue, {
        format: props.format,
        width: props.width,
        height: props.height,
        lineColor: props.lineColor,
        displayValue: false
      })
    }
    watch(
      () => props.codeValue,
      codeValue => {
        if (codeValue) {
          nextTick(getBarCode)
        }
      },
      {
        immediate: true
      }
    )
    return {
      barcode,
      getBarCode
    }
  }
})
</script>

<style scoped></style>
