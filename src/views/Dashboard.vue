<template>
  <div>
    <a-space>
      <a-button @click="handlePreview">打开预览</a-button>
      <a-button @click="handleVersions">版型库</a-button>
    </a-space>
    <Preview v-model:visible="previewState.visible" :current="previewState.current" :urls="previewState.urls"></Preview>
    <Versions
      v-if="versionsState.visible"
      v-model:visible="versionsState.visible"
      :searchProps="versionsState.searchProps"
      :shortcutProps="versionsState.shortcutProps">
      <template #scope>
        <a-space>
          <a-input-number></a-input-number>
          ~
          <a-input-number></a-input-number>
        </a-space>
      </template>
      <template #renderItem="{ item, index }">
        <div class="box">
          <a-checkbox v-model:checked="item.checked">{{ index }}</a-checkbox>
          <x-image width="100%" :urls="item?.urls"></x-image>
          <div class="info">
            <p class="line">
              <span>BX2022001</span>
              <span>类型：版型</span>
            </p>
            <p>分类：亲子装/情侣装/连体衣</p>
            <p class="line">
              <span>角色：妈妈</span>
              <span>面料类型：针织</span>
            </p>
          </div>
        </div>
      </template>
    </Versions>
  </div>
</template>
<script lang="ts">
import { reactive } from 'vue'
import XImage from '@components/Image'
import Preview from '@components/Preview/index.vue'
import Versions from '@business/Versions/index.vue'
export default {
  name: 'Dashboard',
  components: { XImage, Preview, Versions },
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
            type: 'AInput',
            title: '转款式设计款号',
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
        columns: [
          {
            type: 'ACheckboxGroup',
            title: '范围',
            field: 'z',
            props: {
              options: [{ label: '我的收藏', value: 'z' }]
            }
          },
          {
            type: 'ACheckboxGroup',
            title: '类型',
            field: 'x',
            props: {
              options: [
                { label: '版型', value: 'x' },
                { label: '款式', value: 'y' }
              ]
            }
          }
        ]
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
<style lang="scss" scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .info {
    width: 100%;
    margin-top: 10px;

    .line {
      display: flex;
      justify-content: space-between;
    }
  }

  .ant-checkbox-wrapper {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
  }
}
</style>
