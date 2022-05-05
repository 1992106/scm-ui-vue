<template>
  <div>
    <a-space>
      <a-button @click="handlePreview">打开预览</a-button>
      <a-button @click="handleVersions">版型库</a-button>
    </a-space>
    <Preview v-model:visible="previewState.visible" :current="previewState.current" :urls="previewState.urls"></Preview>
    <Versions v-model:visible="versionsState.visible">
      <template #scope>
        <a-space>
          <a-input-number></a-input-number>
          ~
          <a-input-number></a-input-number>
        </a-space>
      </template>
    </Versions>
  </div>
</template>
<script>
import { reactive } from 'vue'
import Preview from '@components/Preview/index.vue'
import Versions from '@business/Versions/index.vue'
export default {
  name: 'Dashboard',
  components: { Preview, Versions },
  setup() {
    // 预览
    const previewState = reactive({
      visible: false,
      current: 2,
      urls: [
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp'
      ]
    })
    const handlePreview = () => {
      previewState.visible = !previewState.visible
    }
    // 版型库
    const versionsState = reactive({
      visible: false,
      searchProps: {
        columns: [
          {
            type: 'AInput',
            title: '版型名称',
            field: 'a',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'AInput',
            title: '版型编号',
            field: 'b',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'ASelect',
            title: '版型分类',
            field: 'c',
            props: {
              placeholder: '请选择'
            }
          },
          {
            type: '转款式设计款号',
            title: '版型编号',
            field: 'd',
            props: {
              placeholder: '请输入'
            }
          },
          {
            type: 'ASelect',
            title: '角色',
            field: 'e',
            props: {
              placeholder: '请选择'
            }
          },
          {
            title: '成本范围',
            slot: 'scope'
          }
        ]
      },
      shortcutProps: {
        columns: []
      },
      tableProps: {}
    })
    const handleVersions = () => {
      versionsState.visible = !versionsState.visible
    }

    return {
      previewState,
      handlePreview,
      versionsState,
      handleVersions
    }
  }
}
</script>
