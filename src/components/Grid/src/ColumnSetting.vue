<template>
  <a-tooltip v-model:visible="visible" color="#fff" trigger="click" placement="bottomRight">
    <a-button
      shape="circle"
      size="middle"
      title="列设置"
      class="vxe-button type--button is--circle"
      @click="handleClick">
      <template #icon>
        <SettingOutlined />
      </template>
    </a-button>
    <template #title>
      <div class="x-grid__setting">
        <div class="setting-head">
          <a-checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
            全选
          </a-checkbox>
          <a-button size="small" type="link" @click="handleReset">重置</a-button>
        </div>
        <div class="setting-body">
          <div v-if="leftFixed.length" class="box">
            <div class="title">固定在左侧</div>
            <draggable :list="leftFixed" item-key="field">
              <template #item="{ element: item }">
                <div class="group">
                  <a-checkbox v-model:checked="item.visible">{{ item.title }}</a-checkbox>
                  <a-space :size="2">
                    <Iconfont
                      type="icon-to-bottom"
                      size="18"
                      title="固定在列尾"
                      @click="handleClickRight('left', item)"></Iconfont>
                    <Iconfont
                      type="icon-to-middle"
                      size="18"
                      title="不固定"
                      @click="handleClickMiddle('left', item)"></Iconfont>
                  </a-space>
                </div>
              </template>
            </draggable>
          </div>
          <div v-if="middleList.length" class="box">
            <div class="title">不固定</div>
            <draggable :list="middleList" item-key="field">
              <template #item="{ element: item }">
                <div class="group">
                  <a-checkbox v-model:checked="item.visible">{{ item.title }}</a-checkbox>
                  <a-space :size="2">
                    <Iconfont
                      type="icon-to-top"
                      size="18"
                      title="固定在列头"
                      @click="handleClickLeft('middle', item)"></Iconfont>
                    <Iconfont
                      type="icon-to-bottom"
                      size="18"
                      title="固定在列尾"
                      @click="handleClickRight('middle', item)"></Iconfont>
                  </a-space>
                </div>
              </template>
            </draggable>
          </div>
          <div v-if="rightFixed.length" class="box">
            <div class="title">固定在右侧</div>
            <draggable :list="rightFixed" item-key="field">
              <template #item="{ element: item }">
                <div class="group">
                  <a-checkbox v-model:checked="item.visible">{{ item.title }}</a-checkbox>
                  <a-space :size="2">
                    <Iconfont
                      type="icon-to-top"
                      size="18"
                      title="固定在列头"
                      @click="handleClickLeft('right', item)"></Iconfont>
                    <Iconfont
                      type="icon-to-middle"
                      size="18"
                      title="不固定"
                      @click="handleClickMiddle('right', item)"></Iconfont>
                  </a-space>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        <div class="setting-foot">
          <a-space>
            <a-button size="small" @click="handleCancel">取消</a-button>
            <a-button type="primary" size="small" @click="handleOk">确定</a-button>
          </a-space>
        </div>
      </div>
    </template>
  </a-tooltip>
</template>
<script>
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import Iconfont from '@components/IconFont'
import draggable from 'vuedraggable'
import { cloneDeep, omit } from 'lodash-es'
import { columnsToStorage, storageToColumns } from './utils'

export default defineComponent({
  name: 'ColumnSetting',
  components: {
    SettingOutlined,
    Iconfont,
    draggable
  },
  props: {
    // 自定义列
    columns: { type: Array, required: true, default: () => [] },
    // 备份自定义列
    backupColumns: { type: Array, required: true, default: () => [] }
  },
  emits: ['change'],
  setup: function (props, { emit }) {
    const state = reactive({
      sourceColumns: [],
      revokeColumns: [], // 撤销备份
      visible: false,
      indeterminate: false,
      checkAll: false,
      // 固定左侧
      leftFixed: [],
      // 不固定
      middleList: [],
      // 固定右侧
      rightFixed: []
    })

    const handleClick = () => {
      state.visible = !state.visible
      if (state.visible) {
        state.sourceColumns = cloneDeep(props.columns)
        const columns = columnsToStorage(props.columns)
        state.revokeColumns = cloneDeep(columns)
        state.leftFixed = columns.filter(val => val?.fixed === 'left')
        state.middleList = columns.filter(val => !val?.fixed)
        state.rightFixed = columns.filter(val => val?.fixed === 'right')
      }
    }

    // 全选
    const handleCheckAll = $event => {
      state.leftFixed.forEach(item => {
        item.visible = $event.target.checked
      })
      state.middleList.forEach(item => {
        item.visible = $event.target.checked
      })
      state.rightFixed.forEach(item => {
        item.visible = $event.target.checked
      })
    }

    watch(
      () => [state.leftFixed, state.middleList, state.rightFixed],
      ([leftFixed, middleList, rightFixed]) => {
        const list = [...leftFixed, ...middleList, ...rightFixed]
        state.checkAll = list.length && list.every(val => val.visible)
        state.indeterminate = list.some(val => !val.visible) && !list.every(val => !val.visible)
      },
      { deep: true }
    )

    const removeLeftFixed = column => {
      const index = state.leftFixed.findIndex(val => val.field === column.field)
      state.leftFixed.splice(index, 1)
    }

    const removeMiddleList = column => {
      const index = state.middleList.findIndex(val => val.field === column.field)
      state.middleList.splice(index, 1)
    }

    const removeRightFixed = column => {
      const index = state.rightFixed.findIndex(val => val.field === column.field)
      state.rightFixed.splice(index, 1)
    }

    // 固定在列头
    const handleClickLeft = (key, $event) => {
      if (key === 'right') {
        removeRightFixed($event)
      } else if (key === 'middle') {
        removeMiddleList($event)
      }
      state.leftFixed.push($event)
    }

    // 不固定
    const handleClickMiddle = (key, $event) => {
      if (key === 'left') {
        removeLeftFixed($event)
        state.middleList.unshift($event)
      } else if (key === 'right') {
        removeRightFixed($event)
        state.middleList.push($event)
      }
    }

    // 固定在列尾
    const handleClickRight = (key, $event) => {
      if (key === 'left') {
        removeLeftFixed($event)
      } else if (key === 'middle') {
        removeMiddleList($event)
      }
      state.rightFixed.unshift($event)
    }

    // 重置
    const handleReset = () => {
      const backupColumns = cloneDeep(columnsToStorage(props.backupColumns))
      state.leftFixed = backupColumns.filter(val => val?.fixed === 'left')
      state.middleList = backupColumns.filter(val => !val?.fixed)
      state.rightFixed = backupColumns.filter(val => val?.fixed === 'right')
    }

    // 取消
    const handleCancel = () => {
      state.visible = false
    }

    // 监听取消操作，重置默认选项
    watch(
      () => state.visible,
      visible => {
        if (visible === false) {
          handleRevoke()
        }
      }
    )

    // 撤销上一次
    const handleRevoke = () => {
      const revokeColumns = cloneDeep(state.revokeColumns)
      state.leftFixed = revokeColumns.filter(val => val?.fixed === 'left')
      state.middleList = revokeColumns.filter(val => !val?.fixed)
      state.rightFixed = revokeColumns.filter(val => val?.fixed === 'right')
    }

    // 确定
    const handleOk = () => {
      const list = [
        ...state.leftFixed.map(val => ({ ...val, fixed: 'left' })),
        ...state.middleList.map(val => omit(val, ['fixed'])),
        ...state.rightFixed.map(val => ({ ...val, fixed: 'right' }))
      ]
      const sourceColumns = cloneDeep(state.sourceColumns)
      emit('change', storageToColumns(list, sourceColumns))
      handleCancel()
    }

    return {
      ...toRefs(state),
      handleClick,
      handleReset,
      handleOk,
      handleCancel,
      handleCheckAll,
      handleClickLeft,
      handleClickMiddle,
      handleClickRight
    }
  }
})
</script>
<style lang="scss" scoped>
.x-grid__setting {
  margin: -6px -8px;
  color: $text-color;
  width: 200px;

  .setting-head {
    padding: 6px 12px;
    @include flexRAC;

    justify-content: space-between;
    border-bottom: 1px solid $border-color-grey;
  }

  .setting-body {
    max-height: 400px;
    padding: 6px 0;
    overflow-y: auto;

    .box {
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .title {
        padding: 0 10px 0 20px;
        font-size: 12px;
        color: $text-color-grey;
      }

      .group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 10px 2px 20px;

        .ant-space {
          display: none;
        }

        &:hover {
          background-color: #1890ff1a;

          > .ant-space {
            display: inline-flex;

            .anticon {
              color: $color-base;
            }
          }
        }
      }
    }
  }

  .setting-foot {
    padding: 6px 12px;
    @include flexRAC;

    justify-content: flex-end;
    border-top: 1px solid $border-color-grey;
  }
}
</style>
