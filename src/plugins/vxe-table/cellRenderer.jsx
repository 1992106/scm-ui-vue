import VXETable from 'vxe-table'
import Image from '@components/Image'
import { get } from 'lodash-es'
import { formatDate, formatTime } from '@src/utils'

export const cellRenderer = {
  // 链接
  MyLink: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const { events, props } = renderOpts
      const title = props?.text
      return [
        <a className='my-link' onClick={() => events?.click(params)}>
          {title | get(row, column.field)}
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
      const thumbnail = get(row, column.field) || ''
      if (renderOpts.props?.previewField) {
        urls = get(row, renderOpts.props.previewField) || []
      }

      if (typeof renderOpts.props?.preview === 'boolean') {
        props.preview = renderOpts.props.preview
      }

      props.width = renderOpts.props?.width || 46
      props.height = renderOpts.props?.height || 46

      if (!thumbnail) {
        return '--'
      }
      return [<Image key={thumbnail} thumbnail={thumbnail} urls={urls} {...props} />]
    }
  },
  MyPhoto: {
    renderDefault(renderOpts, params) {
      const props = {}
      let previewList = []
      const { row, column } = params
      const thumbnail = get(row, column.field) || ''
      if (renderOpts.props?.previewField) {
        previewList = get(row, renderOpts.props.previewField) || []
        props.imgZipFile = renderOpts.props?.imgZipFile
        props.attachmentZipFile = renderOpts.props?.attachmentZipFile
      } else if (renderOpts.props?.customRequest) {
        props.customRequest = async () => {
          return await renderOpts.props.customRequest(row)
        }
      }

      if (typeof renderOpts.props?.preview === 'boolean') {
        props.preview = renderOpts.props.preview
      }

      props.width = renderOpts.props?.width || 46
      props.height = renderOpts.props?.height || 46

      if (!thumbnail) {
        return '--'
      }

      return [<Image mode='complex' key={thumbnail} thumbnail={thumbnail} previewList={previewList} {...props} />]
    }
  },
  MyTime: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const val = get(row, column.field)
      if (!val) {
        return [<span>--</span>]
      }

      const date = formatDate(val, 'yyyy-MM-dd')
      const time = formatTime(val, 'HH:mm')

      return [
        <span style={{ textAlign: 'center' }}>
          {date} <br /> {time}
        </span>
      ]
    }
  },
  MyDate: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const val = get(row, column.field)
      if (!val) {
        return [<span>--</span>]
      }

      const date = formatDate(val, 'yyyy-MM-dd')

      return [<span style={{ textAlign: 'center' }}>{date}</span>]
    }
  },
  MyRemark: {
    renderDefault(renderOpts, params) {
      const { row, column } = params
      const { events, props } = renderOpts
      const title = props?.text || column.title || '备注'
      const num = get(row, props?.countField) || 0

      return [
        <a-button type='link' onClick={() => events?.click(params)} size='small' {...props}>
          ({title} {num})
        </a-button>
      ]
    }
  },
  MyLog: {
    renderDefault(renderOpts, params) {
      const { column } = params
      const { events, props } = renderOpts
      const title = props?.text || column.title || '日志'

      return [
        <a-button type='link' onClick={() => events?.click(params)} size='small' {...props}>
          {title}
        </a-button>
      ]
    }
  }
}

// VXETable渲染器
VXETable.renderer.mixin(cellRenderer)
