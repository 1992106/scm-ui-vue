<template>
  <transition-group ref="xLazy" class="x-lazy-container" v-bind="$attrs" :name="name" :tag="tag" mode="out-in">
    <div v-if="isInit" key="component">
      <slot></slot>
    </div>
    <div v-else key="skeleton">
      <slot name="skeleton">
        <a-skeleton :loading="loading" />
      </slot>
    </div>
  </transition-group>
</template>
<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, reactive, onMounted, ref, toRef, toRefs } from 'vue'
import { Skeleton } from 'ant-design-vue'
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'
import { useTimeoutFn } from '@hooks/useTimeoutFn'

interface State {
  isInit: boolean
  loading: boolean
  intersectionObserverInstance: IntersectionObserver | null
}

export default defineComponent({
  name: 'XLazyContainer',
  components: {
    'a-skeleton': Skeleton
  },
  inheritAttrs: false,
  props: {
    /**
     * Waiting time, if the time is specified, whether visible or not, it will be automatically loaded after the specified time
     */
    timeout: { type: Number },
    /**
     * The viewport where the component is located.
     * If the component is scrolling in the page container, the viewport is the container
     */
    root: {
      type: (typeof window !== 'undefined' ? window.HTMLElement : Object) as PropType<HTMLElement>,
      default: () => null
    },
    rootMargin: { type: String, default: '0px' },
    threshold: { type: Number, default: 0 },
    /**
     * The label name of the outer container that wraps the component
     */
    tag: { type: String, default: 'div' },
    name: { type: String },
    waitingTime: { type: Number, default: 80 }
  },
  emits: ['done'],
  setup(props, { emit }) {
    const xLazy = ref()
    const state = reactive<State>({
      isInit: false,
      loading: true,
      intersectionObserverInstance: null
    })

    function init() {
      state.loading = true
      useTimeoutFn(() => {
        if (state.isInit) return
        state.isInit = true
        emit('done')
      }, props.waitingTime)
    }

    // If there is a set delay time, it will be executed immediately
    function initImmediate() {
      const { timeout } = props
      if (timeout) {
        useTimeoutFn(() => {
          init()
        }, timeout)
      }
    }

    function initIntersectionObserver() {
      const { timeout, root, rootMargin, threshold } = props
      if (timeout) return

      try {
        const { stop, observer } = useIntersectionObserver({
          target: toRef(xLazy.value, '$el'),
          onIntersect: (entries: any[]) => {
            const isIntersecting = entries[0].isIntersecting || entries[0].intersectionRatio
            if (isIntersecting) {
              init()
              if (observer.value) {
                stop()
              }
            }
          },
          options: { root, rootMargin, threshold }
        })
      } catch (e) {
        init()
      }
    }

    onMounted(() => {
      initImmediate()
      initIntersectionObserver()
    })

    return {
      xLazy,
      ...toRefs(state)
    }
  }
})
</script>
