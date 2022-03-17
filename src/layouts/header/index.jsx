import { defineComponent } from 'vue'
import { Layout } from 'ant-design-vue'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import Breadcrumb from '../breadcrumb/index.vue'
import Avatar from '../avatar/index.jsx'
import styles from './index.module.scss'

const PageHeader = defineComponent({
  name: 'MyHeader',
  props: {
    collapsed: {
      type: Boolean
    }
  },
  setup(props, { emit }) {
    return () => (
      <Layout.Header class={styles.layoutHeader}>
        <div className={styles.leftOptions}>
          <span onClick={() => emit('update:collapsed', !props.collapsed)} className={styles.menuFold}>
            {props.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Breadcrumb />
        </div>
        <Avatar />
      </Layout.Header>
    )
  }
})

export default PageHeader
