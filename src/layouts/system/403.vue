<template>
  <Result status="403" title="403" sub-title="Sorry, you don't have access to this page.">
    <template #extra>
      <Button type="primary" @click="backToHome">返回首页</Button>
    </template>
  </Result>
</template>

<script>
import { defineComponent } from 'vue'
import { Result, Button } from 'ant-design-vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: '403',
  components: { Result, Button },
  setup() {
    const router = useRouter()

    const backToHome = () => {
      router.push('/')
    }

    return {
      backToHome
    }
  }
})
</script>
