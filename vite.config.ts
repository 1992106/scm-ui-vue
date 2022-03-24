import { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
// import Components from 'unplugin-vue-components/vite'
// import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import html from 'vite-plugin-html'
import { resolve } from 'path'
import setting from './src/config'

const pathResolve = (dir: string) => resolve(__dirname, dir)

const config: UserConfig = {
  plugins: [
    vue(),
    vueJsx({}),
    // Components({
    //   resolvers: [
    //     AntDesignVueResolver(),
    //   ],
    //   dts: true,
    //   include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    // }),
    html({
      minify: true,
      inject: {
        injectData: {
          title: setting.title
        }
      }
    })
  ],
  base: './',
  resolve: {
    alias: [
      { find: /^@src/, replacement: pathResolve('src') },
      { find: /^@components/, replacement: pathResolve('src/components') },
      { find: /^@library/, replacement: pathResolve('src/library') },
      { find: /^@views/, replacement: pathResolve('src/views') },
      { find: /^@hooks/, replacement: pathResolve('src/hooks') },
      { find: /^@utils/, replacement: pathResolve('src/utils') }
    ]
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {},
        javascriptEnabled: true
      },
      scss: {
        additionalData: '@import "./src/styles/global.scss";'
      }
    }
  },
  optimizeDeps: {
    include: [
      'ant-design-vue/es/locale/zh_CN',
      'ant-design-vue/es/locale/en_US',
      'dayjs/locale/zh-cn',
      'dayjs/locale/en'
    ],
    exclude: []
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        keep_infinity: true, // 防止 Infinity 被压缩成 1/0
        drop_console: true, // 生产环境去除 console
        drop_debugger: true // 生产环境去除 debugger
      }
    }
  }
}

// https://vitejs.dev/config/
export default ({ mode }) => {
  const { plugins = [], build = {} } = config

  if (mode === 'lib') {
    build.lib = {
      entry: pathResolve('src/entry.js'),
      name: 'ScmUI',
      formats: ['es', 'cjs', 'umd']
    }
    build.rollupOptions = {
      output: {
        exports: 'named',
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'vue',
          'ant-design-vue': 'ant-design-vue',
          '@ant-design/icons-vue': '@ant-design/icons-vue',
          dayjs: 'dayjs',
          'lodash-es': 'lodash-es',
          '@vueup/vue-quill': '@vueup/vue-quill',
          echarts: 'echarts',
          html2canvas: 'html2canvas',
          jsbarcode: 'jsbarcode',
          jspdf: 'jspdf',
          'qrcodejs2-fix': 'qrcodejs2-fix',
          'vue-draggable-next': 'vue-draggable-next',
          'vxe-table': 'vxe-table'
        },
        // TODO: Invalid value "iife&umd" for option "output.format" - UMD and IIFE output formats are not supported for code-splitting builds.
        inlineDynamicImports: true
      },
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'ant-design-vue', '@ant-design/icons-vue', 'lodash-es', 'vxe-table']
    }
  }

  if (mode === 'development') {
    config.server = {
      port: 9999,
      open: true
    }
    config.plugins = [...plugins]
  }

  if (mode === 'production') {
    config.plugins = [
      ...plugins,
      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      })
    ]
  }

  return config
}
