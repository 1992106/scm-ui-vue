<template>
  <div ref="qrcodeRef"></div>
</template>
<script>
import { defineComponent, nextTick, ref, watch } from 'vue'
import QRCode from 'qrcodejs2-fix'
export default defineComponent({
  name: 'XQrcode',
  props: {
    code: { type: String, require: true },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 120 },
    colorDark: { type: String, default: '#000' },
    colorLight: { type: String, default: '#fff' },
    correctLevel: { type: String, default: 'L' }
  },
  setup(props) {
    const qrcodeRef = ref(null)

    const generateQRCode = () => {
      // 生成二维码先清空旧的
      if (qrcodeRef.value) {
        qrcodeRef.value.innerHTML = ''
      }
      new QRCode(qrcodeRef.value, {
        text: props.code,
        width: props.width,
        height: props.height,
        colorDark: props.colorDark,
        colorLight: props.colorLight,
        correctLevel: QRCode?.CorrectLevel.L
      })
    }

    watch(
      () => props.code,
      text => {
        if (text) {
          nextTick(generateQRCode)
        }
      },
      {
        immediate: true
      }
    )

    return {
      qrcodeRef
    }
  }
})
</script>
