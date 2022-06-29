<template>
  <x-drawer
    v-bind="$attrs"
    v-model:visible="modalVisible"
    class="x-traceability__dialog"
    :title="title"
    :width="width"
    :height="height"
    :spinProps="spinning"
    destroyOnClose
    @ok="handleOk"
    @cancel="handleCancel">
    <a-form>
      <a-form-item label="请导入主表" name="file" :rules="[{ required: true, message: '请导入主表！' }]">
        <a-upload :showUploadList="false" :before-upload="beforeUpload" :disabled="disabled" @change="handleUpload">
          <a-button>
            <UploadOutlined></UploadOutlined>
            上传
          </a-button>
        </a-upload>
        <template #extra>
          <div>
            支持扩展名：xlx,xlsx；文件大小：4M以下
            <a-button type="link" :loading="loading" @click="handleDownload">查看模板</a-button>
          </div>
        </template>
      </a-form-item>
    </a-form>
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <template v-for="(_, index) in traceabilityList" :key="index">
        <a-collapse-panel>
          <template #header>
            <a-space>
              {{ `溯源包${index + 1}` }}
              <a-button type="link" @click="handleDelete($event, index)">删除</a-button>
            </a-space>
          </template>
          <XTraceability :index="index"></XTraceability>
        </a-collapse-panel>
      </template>
    </a-collapse>
  </x-drawer>
</template>
<script>
import { computed, defineComponent, provide, reactive, toRefs } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import XDrawer from '@packages/components/Drawer'
import XTraceability from './index.vue'
import { isFunction } from 'lodash-es'
import { download, execRequest } from '@src/utils'
export default defineComponent({
  name: 'XBatchImportTraceability',
  components: {
    XDrawer,
    'x-drawer': XDrawer,
    UploadOutlined,
    XTraceability
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '批量导入' },
    width: { type: [String, Number] },
    height: { type: [String, Number] },
    manual: { type: Boolean, default: false },
    // 主表
    customUploadMaster: { type: Function, require: true },
    customDownloadMaster: { type: Function },
    customUpload: { type: Function },
    materialColumns: { type: Array },
    photocopyColumns: { type: Array },
    // 织布
    weavingRowKey: { type: [String, Function], default: 'itemId' },
    weavingColumns: { type: Array, default: () => [] },
    customUploadWeaving: { type: Function },
    customDownloadWeaving: { type: Function },
    // 染整
    dyeingRowKey: { type: [String, Function], default: 'itemId' },
    dyeingColumns: { type: Array },
    customUploadDyeing: { type: Function },
    customDownloadDyeing: { type: Function },
    emptyText: { type: String, default: '暂无数据' }
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
      loading: false,
      disabled: false,
      activeKey: [],
      traceabilityList: []
    })

    const beforeUpload = file => {
      const isExcel = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isExcel) {
        message.error('文件格式只能是xlx,xlsx！')
      }

      const isLt4M = file.size / 1024 / 1024 < 4
      if (!isLt4M) {
        message.error('文件不能大于4M！')
      }

      return isExcel && isLt4M
    }

    const handleUpload = async () => {
      const { customUploadMaster = Function.prototype } = props
      if (!isFunction(customUploadMaster)) return
      state.disabled = true
      await execRequest(customUploadMaster(), {
        success: ({ data }) => {
          //TODO: 根据【'坯纱采购合同号'】，如果有重复，则更新，如果没有则新增
          state.traceabilityList.push({
            masterData: data || [{}],
            photocopyData: [
              {
                certificateImgs: [],
                contractImgs: [],
                logisticsImgs: [],
                contractYarnImgs: [],
                logisticsYarnImgs: [],
                packingImgs: [],
                invoiceImgs: []
              }
            ],
            weavingData: [],
            dyeingData: []
          })
          state.activeKey = state.traceabilityList.map((_, i) => i)
        },
        fail: () => {}
      })
      state.disabled = false
    }

    const handleDownload = async () => {
      const { customDownloadMaster } = props
      if (!isFunction(customDownloadMaster)) return
      state.loading = true
      await execRequest(customDownloadMaster(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.loading = false
    }

    const handleDelete = (event, index) => {
      event.stopPropagation()
      state.traceabilityList.splice(index, 1)
    }

    const handleOk = () => {
      emit('done', {})
      modalVisible.value = false
      handleCancel()
    }

    const handleCancel = () => {
      state.traceabilityList = []
    }

    provide('mode', { master: 'action', weaving: 'action', dyeing: 'action' })
    provide('traceabilityList', state.traceabilityList)
    provide('beforeUpload', beforeUpload)

    return {
      ...toRefs(state),
      modalVisible,
      beforeUpload,
      handleUpload,
      handleDownload,
      handleDelete,
      handleOk,
      handleCancel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-traceability {
}
</style>
<style lang="scss">
.x-traceability__dialog {
  &.x-modal {
    top: 24px;
  }
}
</style>
