<template>
  <x-modal
    v-bind="$attrs"
    v-model:visible="modalVisible"
    :title="title"
    :width="width"
    :spin-props="spinning"
    destroy-on-close
    :footer="null">
    <div>
      一、请按照数据模式的格式准备导入数据，模版中的表头名称不可更改及删除，每次限制导入
      {{ limit }}
      行。
      <span v-if="extra" class="color-error">{{ extra }}</span>
      <br />
      <slot>
        <a-button type="link" :loading="loading" @click="handleDownload">下载模版</a-button>
      </slot>
    </div>
    <div style="margin-top: 20px">
      <p style="margin-bottom: 10px">二、将准备好的数据导入</p>
      <a-upload
        class="import-template"
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        list-type="picture-card"
        :show-upload-list="false"
        :custom-request="handleImport">
        <div>
          <UploadOutlined />
          <p>选择导入的文件</p>
        </div>
      </a-upload>
    </div>
  </x-modal>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import XModal from '@components/Modal'
import { importFile } from './import'
import { download } from '@src/utils'

export default defineComponent({
  name: 'XImport',
  components: {
    UploadOutlined,
    'x-modal': XModal
  },
  props: {
    title: { type: String, default: '导入数据' },
    width: { type: Number, default: 520 },
    visible: { type: Boolean, default: false },
    customRequest: { type: Function, required: true },
    customDownload: { type: Function },
    limit: { type: Number, default: 500 },
    extra: { type: String }
  },
  emits: ['update:visible', 'done'],
  setup(props, { emit }) {
    const modalVisible = computed({
      get: () => {
        return props.visible
      },
      set: val => {
        emit('update:visible', val)
      }
    })

    const state = reactive({
      spinning: false,
      loading: false
    })

    const handleImport = async data => {
      if (!props.customRequest) return
      state.spinning = true
      await importFile(props.customRequest, data, () => {
        modalVisible.value = false
        emit('done')
      })
      state.spinning = false
    }

    const handleDownload = async () => {
      if (!props.customDownload) return
      state.loading = true
      const data = await props.customDownload()
      state.loading = false
      download(data?.url, data?.name)
    }

    return {
      ...toRefs(state),
      modalVisible,
      handleImport,
      handleDownload
    }
  }
})
</script>
<style lang="scss" scoped>
:deep(.import-template) {
  .ant-upload.ant-upload-select-picture-card {
    width: 120px;
    height: 120px;
  }
}
</style>
