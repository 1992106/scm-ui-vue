<template>
  <x-list item-layout="vertical" :data-source="listData" rowKey="title">
    <template #toolBar>
      <a-space><a-button>按钮</a-button></a-space>
    </template>
    <template #header>
      <div>
        <b>ant design vue</b>
        List列表
      </div>
    </template>
    <template #footer>
      <div>footer</div>
    </template>
    <template #itemRender="{ item, index }">{{ index }} - {{ item.content }}</template>
    <template #avatar="{ item }"><a-avatar :src="item.avatar" /></template>
    <template #title="{ item }">
      <a :href="item.href">{{ item.title }}</a>
    </template>
    <template #description="{ item }">{{ item.description }}</template>
    <template #actions>
      <span v-for="{ type, text } in actions" :key="type">
        <component :is="type" style="margin-right: 8px" />
        {{ text }}
      </span>
    </template>
    <template #extra>
      <img width="272" alt="logo" src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png" />
    </template>
  </x-list>
</template>
<script lang="ts">
import { defineComponent, onActivated, onMounted, onUnmounted } from 'vue'
import { StarOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons-vue'
import XList from '@components/List'
const listData = []
for (let i = 0; i < 23; i++) {
  listData.push({
    href: 'https://www.antdv.com/',
    title: `ant design vue part ${i}`,
    avatar: 'https://joeschmoe.io/api/v1/random',
    description: 'Ant Design, a design language for background applications, is refined by Ant UED Team.',
    content:
      'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.'
  })
}
export default defineComponent({
  name: 'Example',
  components: {
    XList,
    StarOutlined,
    LikeOutlined,
    MessageOutlined
  },
  setup() {
    const actions = [
      {
        type: 'StarOutlined',
        text: '156'
      },
      {
        type: 'LikeOutlined',
        text: '156'
      },
      {
        type: 'MessageOutlined',
        text: '2'
      }
    ]

    onMounted(() => {
      console.log('onMounted', 'Example组件')
    })
    onActivated(() => {
      console.log('onActivated', 'Example组件')
    })
    onUnmounted(() => {
      console.log('onUnmounted', 'Example组件')
    })

    return {
      listData,
      actions
    }
  }
})
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
