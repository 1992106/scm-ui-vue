<template>
  <div :class="['x-search', showExpand ? 'show-expand' : '']">
    <div v-if="hasExtra" class="extra">
      <slot name="extra"></slot>
    </div>
    <x-form
      ref="xForm"
      v-bind="$attrs"
      :layout="layout"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :columns="getColumns"
      @enter="handleSearch"
      @clear="handleClear">
      <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
      <div class="actions">
        <a-space>
          <template v-if="showSearch">
            <a-button type="primary" @click.prevent="handleSearch">{{ searchText }}</a-button>
          </template>
          <template v-if="showReset">
            <a-button @click="handleReset">{{ resetText }}</a-button>
          </template>
          <div v-if="isShowExpand" class="expand" @click="handleExpand">
            <template v-if="isExpand">
              <span>收起</span>
              <UpOutlined />
            </template>
            <template v-else>
              <span>展开</span>
              <DownOutlined />
            </template>
          </div>
        </a-space>
      </div>
    </x-form>
    <div v-if="hasShortcut" class="shortcut">
      <slot name="shortcut"></slot>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, nextTick, onMounted, ref, unref } from 'vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import XForm from '@components/Form/index.vue'
import { useFormLayout } from './useFormLayout'
import { toDisabled } from '@components/Form/utils'

export default defineComponent({
  name: 'XSearch',
  components: {
    'x-form': XForm,
    DownOutlined,
    UpOutlined
  },
  inheritAttrs: false,
  props: {
    // 表单自定义字段
    columns: { type: Array, required: true, default: () => [] },
    // 表单布局
    layout: {
      validator(value) {
        return ['horizontal', 'vertical', 'inline'].includes(value)
      },
      default: 'inline'
    },
    // 标签布局
    labelCol: { type: Object, default: () => ({}) },
    // 控件布局
    wrapperCol: { type: Object, default: () => ({}) },
    // 重置时是否触发搜索
    resetSearch: { type: Boolean, default: true },
    // 清空时是否触发搜索
    clearSearch: { type: Boolean, default: false },
    // 按钮
    showSearch: { type: Boolean, default: true },
    searchText: { type: String, default: '搜索' },
    showReset: { type: Boolean, default: true },
    resetText: { type: String, default: '重置' },
    // 展开/收起
    showExpand: { type: Boolean, default: false },
    defaultExpand: { type: Boolean, default: false }
  },
  emits: ['search', 'reset', 'clear'],
  setup(props, { emit, slots }) {
    const xForm = ref(null)

    // 搜索columns
    const getColumns = computed(() => {
      const columns = props?.columns || []
      return columns.map(column => toDisabled(column))
    })

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props?.columns || []
      return columns.map(col => col.slot).filter(Boolean)
    })

    const handleSearch = () => {
      unref(xForm)
        .validate()
        .then(() => {
          onEmit()
        })
        .catch(err => {
          console.error('from error', err)
        })
    }

    const onEmit = () => {
      emit('search', unref(xForm).onGetFormValue())
    }

    const handleReset = () => {
      unref(xForm).resetFields()
      emit('reset', unref(xForm).onGetFormValue())
      if (props.resetSearch) {
        onEmit()
      }
    }

    const handleClear = () => {
      emit('clear', unref(xForm).onGetFormValue())
      if (props.clearSearch) {
        onEmit()
      }
    }

    // 表单布局
    const { updateLayout, hasExpand } = useFormLayout()
    const isExpand = ref(props.defaultExpand)
    const handleExpand = () => {
      isExpand.value = !isExpand.value
      updateLayout()
    }

    const isShowExpand = ref(false)
    onMounted(() => {
      if (props.showExpand === true) {
        isShowExpand.value = hasExpand()
      }
      // 默认收起
      nextTick(() => {
        if (props.defaultExpand === false && props.showExpand === true) {
          updateLayout()
        }
      })
    })

    // 是否显示插槽
    const hasExtra = computed(() => !!slots['extra'])
    const hasShortcut = computed(() => !!slots['shortcut'])

    // 搜索方法
    const onSearch = () => {
      nextTick(() => {
        handleSearch()
      })
    }

    // 重置方法
    const onReset = () => {
      nextTick(() => {
        handleReset()
      })
    }

    return {
      xForm,
      hasExtra,
      hasShortcut,
      handleSearch,
      handleReset,
      handleClear,
      getColumns,
      getSearchSlots,
      onSearch,
      onReset,
      isExpand,
      isShowExpand,
      handleExpand
    }
  }
})
</script>
<style lang="less" scoped>
.x-search {
  background-color: #fff;
  border-radius: 2px;

  .ant-form {
    :deep(.ant-form-item) {
      line-height: 40px;
    }

    .actions {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      line-height: 40px;

      :deep(.expand) {
        cursor: pointer;
        min-width: 50px;
      }
    }
  }

  .extra {
    margin: 0 10px 6px 10px;
  }

  .shortcut {
    margin: 6px 10px 0 10px;
  }

  // 展开收起
  &.show-expand {
    .ant-form {
      // 水平布局、垂直布局
      &.ant-form-horizontal {
        display: flex;
        flex-wrap: wrap;
        margin-right: 36px;

        :deep(.ant-form-item) {
          display: inline-flex;
          margin-bottom: 0;
          width: 25%;

          // 显示、隐藏
          &.hidden {
            display: none !important;
          }

          .ant-input-affix-wrapper,
          .ant-select,
          .ant-cascader-picker,
          .ant-calendar-picker,
          .ant-time-picker,
          .tree-select {
            width: 100%;
          }

          .ant-form-item-control-input-content {
            .ant-input-number,
            .ant-picker {
              width: 100%;
            }
          }

          .ant-calendar-picker {
            span[class='ant-calendar-picker-input ant-input'] {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
