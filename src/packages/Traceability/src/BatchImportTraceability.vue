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
      <a-form-item label="请导入主表" :required="true">
        <a-upload
          :showUploadList="false"
          :before-upload="beforeImport"
          :disabled="disabled"
          :custom-request="handleImportMaster">
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
          <XTraceability
            :index="index"
            :emptyText="emptyText"
            :masterProps="{
              materialColumns,
              customUpload,
              beforeUpload,
              photocopyColumns
            }"
            :weavingProps="{
              weavingRowKey,
              weavingColumns,
              customImportWeaving,
              beforeImportWeaving,
              customDownloadWeaving
            }"
            :dyeingProps="{
              dyeingRowKey,
              dyeingColumns,
              customImportDyeing,
              beforeImportDyeing,
              customDownloadDyeing
            }"></XTraceability>
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
    emptyText: { type: String, default: '暂无数据' },
    // 主表
    customImportMaster: { type: Function, require: true },
    beforeImportMaster: { type: Function },
    customDownloadMaster: { type: Function },
    materialColumns: { type: Array },
    customUpload: { type: Function },
    beforeUpload: { type: Function },
    photocopyColumns: { type: Array },
    // 织布
    weavingRowKey: { type: [String, Function], default: 'uid' },
    weavingColumns: { type: Array },
    customImportWeaving: { type: Function },
    beforeImportWeaving: { type: Function },
    customDownloadWeaving: { type: Function },
    // 染整
    dyeingRowKey: { type: [String, Function], default: 'uid' },
    dyeingColumns: { type: Array },
    customImportDyeing: { type: Function },
    beforeImportDyeing: { type: Function },
    customDownloadDyeing: { type: Function }
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

    const beforeImport = file => {
      if (isFunction(props.beforeImportMaster)) {
        return props.beforeImportMaster(file)
      }

      const isExcel =
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isExcel) {
        message.error('文件格式只能是xlx,xlsx！')
      }

      const isLt4M = file.size / 1024 / 1024 < 4
      if (!isLt4M) {
        message.error('文件不能大于4M！')
      }

      return isExcel && isLt4M
    }

    const handleImportMaster = async ({ file }) => {
      const { customImportMaster } = props
      if (!isFunction(customImportMaster)) return
      state.disabled = true
      await execRequest(customImportMaster(file), {
        success: ({ data }) => {
          // 根据【'坯纱采购合同号'】，如果有重复，则更新，如果没有则新增
          const masterData = state.traceabilityList.masterData || []
          const blankYarnPurchaseNos = masterData.map(val => val?.blankYarnPurchaseNo)
          const oldList = (data || []).filter(val => blankYarnPurchaseNos.includes(val?.blankYarnPurchaseNo))
          const newList = (data || []).filter(val => !blankYarnPurchaseNos.includes(val?.blankYarnPurchaseNo))
          // 更新数据
          if (oldList.length) {
            oldList.forEach(item => {
              const index = masterData.findIndex(val => val?.uid === item?.uid)
              state.traceabilityList.masterData.splice(index, 0, item)
            })
          }
          // 插入数据
          if (newList.length) {
            newList.forEach(item => {
              state.traceabilityList.push({
                masterData: [item],
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
            })
          }
          state.activeKey = state.traceabilityList.map((_, i) => i)
        }
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
      state.activeKey.pop()
    }

    const handleOk = () => {
      emit('done', state.traceabilityList)
      modalVisible.value = false
      handleCancel()
    }

    const handleCancel = () => {
      state.traceabilityList = []
    }

    provide('mode', { master: 'action', weaving: 'action', dyeing: 'action' })
    provide('traceabilityList', state.traceabilityList)

    return {
      ...toRefs(state),
      modalVisible,
      beforeImport,
      handleImportMaster,
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
