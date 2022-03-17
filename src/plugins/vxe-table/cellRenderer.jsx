import VXETable from 'vxe-table'
import XEUtils from 'xe-utils'
import Image from '@components/Image'
import { get } from 'lodash-es'

// VXETable渲染器
VXETable.renderer.mixin({
  // 链接
  MyLink: {
    renderDefault(renderOpts, params) {
      let { row, column } = params
      let { events } = renderOpts
      return [
        <a className='my-link' onClick={() => events?.click(params)}>
          {get(row, column.property)}
        </a>
      ]
    }
  },
  /**
   * 缩略图
   * @example
   *  const data = { thumbnail: 'a.jpg', preview: 'b.jpg', images: [{name: 'c', src: 'c.jpg'}, {name: 'd', url: 'd.jpg' }]}
   *  const columns = [
   *    { title: '缩略图', field: 'thumbnail', width: 70, cellRender: { name: 'MyPic', props: { previewField: 'preview'， width: 30 } }} // width (可不传，默认46)
   *  ]
   */
  MyThumb: {
    renderDefault(renderOpts, params) {
      const props = {}
      let urls = []
      const { row, column } = params
      const thumbnail = get(row, column.property) || ''
      if (renderOpts.props?.previewField) {
        urls = get(row, renderOpts.props.previewField) || []
      }

      if (typeof renderOpts.props?.preview === 'boolean') {
        props.preview = renderOpts.props.preview
      }

      if (renderOpts.props?.width) {
        props.width = renderOpts.props.width
      }

      if (!thumbnail) {
        return '--'
      }
      return [<Image key={thumbnail} width={46} height={46} thumbnail={thumbnail} urls={urls} {...props} />]
    }
  },
  MyDateTime: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const val = get(row, column.property)
      if (!val) {
        return [<span>--</span>]
      }

      const date = XEUtils.toDateString(val, 'yyyy-MM-dd')
      const time = XEUtils.toDateString(val, 'HH:mm')

      return [
        <span style={{ textAlign: 'center' }}>
          {date} <br /> {time}
        </span>
      ]
    }
  }
})
