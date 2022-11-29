import { defineComponent } from 'vue'
import XImage from '@components/Image'
import { get } from 'lodash-es'
import { formatDate, formatTime, isEmpty } from '@src/utils'

const CellRender = defineComponent({
  name: 'CellRender',
  inheritAttrs: false,
  setup(props, { attrs }) {
    const { dataIndex, cellRender: { name, props: options } = {} } = attrs.column || {}

    // 缩略图
    const renderThumbnail = () => {
      const { record } = attrs
      const value = get(record, dataIndex)
      const { previewField, width = 50, height = 50, ...restProps } = options || {}
      let urls = []
      if (previewField) {
        urls = get(record, previewField) || []
      }

      // 如果缩略图和预览图都为空，则展示'--';
      // 如果缩略图不为空，则是单图模式；如果缩略图为空，则是多图预览模式；
      if (isEmpty(value) && isEmpty(urls)) {
        return <>--</>
      }

      return <XImage mode='simple' width={width} height={height} thumbnail={value} urls={urls} {...restProps} />
    }

    // 相册
    const renderPhoto = () => {
      const { record } = attrs
      const value = get(record, dataIndex)
      const {
        previewField,
        imgZipFile,
        attachmentZipFile,
        customRequest,
        width = 50,
        height = 50,
        ...restProps
      } = options || {}

      let previewList = [] // 预览图片
      let onCustomRequest = null // 预览请求方法
      if (previewField) {
        previewList = get(record, previewField) || []
      } else if (customRequest) {
        onCustomRequest = async () => await customRequest(record)
      }

      if (isEmpty(value) && (isEmpty(previewList) || !customRequest)) {
        return <>--</>
      }

      return (
        <XImage
          mode='complex'
          width={width}
          height={height}
          thumbnail={value}
          previewList={previewList}
          imgZipFile={imgZipFile}
          attachmentZipFile={attachmentZipFile}
          customRequest={onCustomRequest}
          {...restProps}
        />
      )
    }

    // 日期
    const renderDate = () => {
      const value = get(attrs.record, dataIndex)
      const date = formatDate(value)

      if (isEmpty(value)) {
        return <>--</>
      }

      return <>{date}</>
    }

    // 时间
    const renderTime = () => {
      const value = get(attrs.record, dataIndex)
      const date = formatDate(value)
      const time = formatTime(value, 'HH:mm:ss')

      if (isEmpty(value)) {
        return <>--</>
      }

      return (
        <>
          {date}
          <br />
          {time}
        </>
      )
    }

    return () =>
      name === 'thumbnail'
        ? renderThumbnail()
        : name === 'photo'
        ? renderPhoto()
        : name === 'date'
        ? renderDate()
        : name === 'time'
        ? renderTime()
        : null
  }
})

export default CellRender
