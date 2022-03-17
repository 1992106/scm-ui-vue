import { getAccessStorage, removeAccessStorage, setAccessStorage, isEmpty } from '@src/utils'
import setting from '@src/config'

// 本地存储用户信息
const localUserInfo = getAccessStorage(setting.user_name)

const user = {
  state: {
    userInfo: localUserInfo ? JSON.parse(localUserInfo) : {}
  },
  getters: {
    userInfo: state => state.userInfo
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    }
  },
  actions: {
    async login({ commit }, { name, password }) {
      const res = await { name, password }
      const { token = '', user = {} } = res?.data || {}
      if (isEmpty(token) || isEmpty(user)) {
        return {}
      }
      commit('setUserInfo', user)
      setAccessStorage(setting.token_name, token)
      setAccessStorage(setting.user_name, JSON.stringify(user))
      return res?.data
    },
    logout({ commit }) {
      commit('setUserInfo', {})
      commit('router/reset', null, { root: true })
      removeAccessStorage(setting.token_name)
      removeAccessStorage(setting.user_name)
    }
  }
}

export default user
