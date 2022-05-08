<template>
  <div :class="['x-search', isShowExpand ? 'show-expand' : '']">
    <div v-if="hasExtra" class="extra">
      <slot name="extra"></slot>
    </div>
    <x-form
      ref="xForm"
      v-bind="$attrs"
      :layout="layout"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :row-props="rowProps"
      :col-props="colProps"
      :columns="getColumns"
      :expand="isExpand"
      @enter="handleSearch"
      @clear="handleClear">
      <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
      <template #actions>
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
      </template>
    </x-form>
    <div v-if="hasShortcut" class="shortcut">
      <slot name="shortcut"></slot>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, nextTick, ref, unref } from 'vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import XForm from '@components/Form/index.vue'
import { toDisabled } from '@components/Form/utils'

export default defineComponent({
  name: 'XSearch',
  components: {
    DownOutlined,
    UpOutlined,
    'x-form': XForm
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
      default: 'horizontal'
    },
    // 标签布局
    labelCol: { type: Object, default: () => ({ span: 10 }) },
    // 控件布局
    wrapperCol: { type: Object, default: () => ({ span: 14 }) },
    // row
    rowProps: { type: Object, default: () => ({ gutter: 24 }) },
    // col
    colProps: { type: Object, default: () => ({ span: 6 }) },
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
    expand: { type: Boolean, default: false }
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
      emit('search', unref(xForm).onGetFormValues())
    }

    const handleReset = () => {
      unref(xForm).resetFields()
      emit('reset', unref(xForm).onGetFormValues())
      if (props.resetSearch) {
        onEmit()
      }
    }

    const handleClear = () => {
      emit('clear', unref(xForm).onGetFormValues())
      if (props.clearSearch) {
        onEmit()
      }
    }

    // 判断是否只有一行：如果只有一行，则不需要【展开/收起】按钮
    const isShowExpand = computed(() => {
      if (props.colProps?.span) {
        const multiple = 24 / props.colProps.span
        return props.showExpand && props.columns.length >= multiple
      } else {
        return props.showExpand
      }
    })

    // 展开/收起
    const isExpand = ref(props.expand)
    const handleExpand = () => {
      isExpand.value = !isExpand.value
      nextTick(() => {
        dispatchResize()
      })
    }

    const dispatchResize = () => {
      const event = document.createEvent('HTMLEvents')
      event.initEvent('resize', true, true)
      window.dispatchEvent(event)
    }

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

  .extra {
    margin: 0 10px 6px 10px;
  }

  .shortcut {
    margin: 6px 10px 0 10px;
  }

  // 展开收起
  .ant-form {
    margin-right: 20px;

    :deep(.actions) {
      text-align: right;

      .expand {
        cursor: pointer;
        min-width: 50px;
      }
    }
    &.ant-form-horizontal {
      :deep(.ant-form-item) {
        margin-bottom: 10px;

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
</style>
