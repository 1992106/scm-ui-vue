<template>
  <div class="download-list" :style="getStyle">
    <template v-if="data.length">
      <div v-for="(file, index) in data" :key="getValueByRowKey(rowKey, file) || index" class="download-item">
        <div class="download-item__icon"></div>
        <div class="download-item__box">
          <div class="name" :title="file?.fileName">{{ file?.fileName }}</div>
          <div class="actions">
            <p v-if="file?.taskStatus === 0">
              任务排队中...
              <a style="float: right" @click="handleCancel(file)">取消</a>
            </p>
            <p v-if="file?.taskStatus === 1">正在下载中...</p>
            <template v-if="file?.taskStatus === 2">
              <a v-if="file?.exportResult === 1" @click="handleDownload(file)">下载</a>
              <!--<a v-else @click="handleRetry(file)">重新导出</a>-->
            </template>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <a-empty :image="simpleImage" :description="emptyText" />
    </template>
  </div>
</template>
<script>
import { computed, defineComponent } from 'vue'
import { Empty } from 'ant-design-vue'
import { isFunction } from 'lodash-es'
import { download, getStyleSize } from '@src/utils'
import { getValueByRowKey } from '@components/Table/utils'

export default defineComponent({
  name: 'DownloadList',
  components: {
    'a-empty': Empty
  },
  inheritAttrs: false,
  props: {
    width: [String, Number],
    height: [String, Number],
    data: { type: Array, default: () => [] },
    rowKey: [String, Function],
    customDownload: Function,
    customCancel: Function,
    emptyText: String
  },
  setup(props) {
    const getStyle = computed(() => {
      return getStyleSize({ width: props.width, maxHeight: props.height })
    })

    const handleDownload = async row => {
      const { customDownload } = props
      if (!isFunction(customDownload)) return
      const [err, data] = await customDownload(row)
      if (!err) {
        download(data?.url, data?.fileName)
      }
    }

    const handleCancel = async row => {
      const { customCancel } = props
      if (!isFunction(customCancel)) return
      await customCancel(row)
    }

    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      getStyle,
      handleDownload,
      handleCancel,
      getValueByRowKey
    }
  }
})
</script>
<style scoped lang="scss">
.x-downloads {
  .download-list {
    overflow-x: hidden;
    overflow-y: auto;

    .download-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 10px;

      .download-item__icon {
        width: 30px;
        text-align: left;
        font-size: 20px;
      }

      .download-item__box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;

        & > .name {
          @include ellipsis;
        }
      }
    }
  }
}
</style>
