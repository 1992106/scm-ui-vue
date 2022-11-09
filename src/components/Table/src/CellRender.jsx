import { defineComponent } from 'vue'
import XImage from '@components/Image'
import { get } from 'lodash-es'
import { formatDate, formatTime, isEmpty } from '@src/utils'

const CellRender = defineComponent({
  name: 'CellRender',
  inheritAttrs: false,
  setup(props, { attrs }) {
    const { record, column } = attrs
    const { cellRender: { name, props: options } = {} } = column || {}

    // 缩略图
    const renderThumbnail = () => {
      const value = get(record, column?.dataIndex || column?.key)
      const { previewField, width = 50, height = 50, ...restProps } = options || {}
      let urls = []
      if (previewField) {
        urls = get(record, previewField) || []
      }

      if (isEmpty(value) || isEmpty(urls)) {
        return <>--</>
      }

      return <XImage mode='simple' width={width} height={height} thumbnail={value} urls={urls} {...restProps} />
    }

    // 相册
    const renderPhoto = () => {
      const value = get(record, column?.dataIndex || column?.key)
      const {
        previewField,
        imgZipFile,
        attachmentZipFile,
        customRequest,
        width = 50,
        height = 50,
        ...restProps
      } = options || {}
      let previewList = []
      if (previewField) {
        previewList = get(record, previewField) || []
      }

      const handleCustomRequest = customRequest ? async () => await customRequest(record) : null

      if (isEmpty(value) || isEmpty(previewList) || !customRequest) {
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
          customRequest={handleCustomRequest}
          {...restProps}
        />
      )
    }

    // 日期
    const renderDate = () => {
      const value = get(record, column?.dataIndex || column?.key)
      const date = formatDate(value)

      if (isEmpty(value)) {
        return <>--</>
      }

      return <>{date}</>
    }

    // 时间
    const renderTime = () => {
      const value = get(record, column?.dataIndex || column?.key)
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
