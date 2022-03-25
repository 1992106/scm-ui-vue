<template>
  <div class="my-editor">
    <QuillEditor v-bind="$attrs" ref="editorRef" theme="snow" content-type="html" :toolbar="toolbar"></QuillEditor>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default defineComponent({
  name: 'XEditor',
  components: {
    QuillEditor
  },
  setup: () => {
    const editorRef = ref()
    const state = reactive({
      toolbar: [
        [{ header: 1 }, { header: 2 }, { size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', { color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean']
      ]
    })
    return {
      editorRef,
      ...toRefs(state)
    }
  }
})
</script>
<style lang="scss" scoped>
.my-editor {
  :deep(.ql-container) {
    height: 320px;
  }

  :deep(.ql-snow) {
    .ql-tooltip[data-mode='link']::before {
      content: '链接';
    }

    .ql-tooltip.ql-editing a.ql-action::after {
      content: '保存';
    }
  }
}
</style>
