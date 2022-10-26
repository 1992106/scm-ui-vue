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

    const value = get(record, column?.dataIndex || column?.key)
    const renderEmpty = () => {
      return <>--</>
    }

    // 缩略图
    const renderThumbnail = () => {
      const { previewField, width = 50, height = 50, ...restProps } = options || {}
      let urls = []
      if (previewField) {
        urls = get(record, previewField) || []
      }

      return <XImage width={width} height={height} thumbnail={value} urls={urls} {...restProps} />
    }

    // 相册
    const renderPhoto = () => {
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
      const date = formatDate(value)

      return <>{date}</>
    }

    // 时间
    const renderTime = () => {
      const date = formatDate(value)
      const time = formatTime(value, 'HH:mm:ss')

      return (
        <>
          {date}
          <br />
          {time}
        </>
      )
    }

    return () =>
      isEmpty(value)
        ? renderEmpty()
        : name === 'thumbnail'
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
