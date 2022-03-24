import { defineComponent, computed, createVNode } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Menu, Dropdown, Avatar, Modal, notification } from 'ant-design-vue'
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import setting from '@src/config'
import styles from './index.module.scss'

const MyAvatar = defineComponent({
  name: 'MyAvatar',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const userInfo = computed(() => store.state.user.userInfo)

    const handleMenuClick = e => {
      if (e.key === 'logout') {
        Modal.confirm({
          title: '提示',
          icon: createVNode(ExclamationCircleOutlined),
          content: `您确定要退出${setting.title}吗？`,
          onOk: handleLogout
        })
      }
    }

    const handleLogout = async () => {
      await store.dispatch('user/logout')
      notification.success({
        message: '提示',
        description: `已成功退出${setting.title}！`
      })
      await router.push(`/login?redirect=${route.path}`)
    }

    const menu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key='logout'>退出登录</Menu.Item>
      </Menu>
    )

    return () => (
      <Dropdown overlay={menu} class={styles.userDropdown}>
        <div>
          <Avatar size={28} src={`https://api.multiavatar.com/${userInfo.value.name}.png`} />
          <span className={styles.name}>{userInfo.value.name}</span>
          <DownOutlined class={styles.icon} />
        </div>
      </Dropdown>
    )
  }
})

export default MyAvatar
