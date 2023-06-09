import { message } from 'ant-design-vue'
import { getImageSize, getVideoSize, isEmpty } from '@src/utils'

const getType = file => file?.type || file?.mimeType || file?.mimetype

const getName = file => file?.name || file?.fileName || file?.filename

const hasImageByType = type => {
  // 排除特殊图片格式：rgb/pcx/psd/dwg/mdi/pgm/cmx
  return (
    type?.includes('image/') &&
    ![
      'image/x-pcx',
      'image/x-rgb',
      'image/vnd.adobe.photoshop',
      'image/vnd.dwg',
      'image/vnd.ms-modi',
      'image/x-portable-graymap',
      'image/x-cmx'
    ].includes(type)
  )
}

const hasImageByName = name => {
  if (name) {
    const suffix = /\.([0-9a-zA-Z]+)$/i.exec(name)?.[1]?.toLowerCase()
    return ['png', 'jpg', 'jpeg', 'ico', 'gif', 'bmp', 'webp'].includes(suffix)
  }
}

const hasImageByUrl = url => {
  if (url) {
    return /^.+(\.png|\.jpg|\.jpeg|\.ico|\.gif|\.bmp|\.webp)$/i.test(url)
  }
}

export const hasImage = file => {
  const type = getType(file)
  const name = getName(file)
  return hasImageByType(type) || hasImageByName(name) || hasImageByUrl(file?.url)
}

export const getFileExpanded = file => {
  const name = getName(file)
  if (name) {
    return name?.split('.')?.pop()?.toUpperCase()
  }
  const type = getType(file)
  if (type) {
    return type?.split('/')?.pop()?.toUpperCase()
  }
}

export const getBeforeUpload = async (file, props) => {
  // 格式
  if (!isEmpty(props.accept)) {
    let isAccept = true
    const accepts = props.accept.split(',')
    const type = file.type?.split('/').pop()
    const name = file.name?.split('.').pop()
    if (file.type.startsWith('image/')) {
      isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('image/'))
    }
    if (file.type.startsWith('application/')) {
      isAccept = accepts.some(
        accept => accept.includes(name) || accept.includes(type) || accept.includes('application/')
      )
    }
    if (file.type.startsWith('audio/')) {
      isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('audio/'))
    }
    if (file.type.startsWith('video/')) {
      isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('video/'))
    }
    if (file.type.startsWith('text/')) {
      isAccept = accepts.some(accept => accept.includes(name) || accept.includes(type) || accept.includes('text/'))
    }
    if (!isAccept) {
      message.error(`只能上传${props.accept}格式`)
      return false
    }
  }
  // 大小
  if (!isEmpty(props.size)) {
    let isLtM = file.size / 1024 / 1024 <= props.size
    if (!isLtM) {
      message.error(`不能大于${props.size}M`)
      return false
    }
  }
  // 图片、视频宽高或尺寸比
  if (
    !isEmpty(props.ratio) ||
    !isEmpty(props.width) ||
    !isEmpty(props.minWidth) ||
    !isEmpty(props.maxWidth) ||
    !isEmpty(props.height) ||
    !isEmpty(props.minHeight) ||
    !isEmpty(props.maxHeight)
  ) {
    let result
    if (file.type.startsWith('image/')) {
      result = await getImageSize(file)
    }
    if (file.type.startsWith('video/')) {
      result = await getVideoSize(file)
    }
    if (result) {
      const { width = 0, height = 0 } = result
      // 比例
      if (!isEmpty(props.ratio) && Array.isArray(props.ratio)) {
        const [w, h] = props.ratio
        if (w * height !== h * width) {
          message.error(`尺寸比不等于${w}*${h}`)
          return false
        }
      }
      // 宽度
      if (!isEmpty(props.width)) {
        if (width !== props.width) {
          message.error(`宽度不等于${props.width}`)
          return false
        }
      }
      // 最小宽度
      if (!isEmpty(props.minWidth)) {
        const isMinWidth = width >= props.minWidth
        if (!isMinWidth) {
          message.error(`宽度不能小于${props.minWidth}`)
          return false
        }
      }
      // 最大宽度
      if (!isEmpty(props.maxWidth)) {
        const isMaxWidth = width <= props.maxWidth
        if (!isMaxWidth) {
          message.error(`宽度不能大于${props.maxWidth}`)
          return false
        }
      }
      // 高度
      if (!isEmpty(props.height)) {
        if (width !== props.height) {
          message.error(`高度不等于${props.height}`)
          return false
        }
      }
      // 最小高度
      if (!isEmpty(props.minHeight)) {
        const isMinHeight = width >= props.minHeight
        if (!isMinHeight) {
          message.error(`高度不能小于${props.minHeight}`)
          return false
        }
      }
      // 最大高度
      if (!isEmpty(props.maxHeight)) {
        const isMaxHeight = height <= props.maxHeight
        if (!isMaxHeight) {
          message.error(`高度不能大于${props.maxHeight}`)
          return false
        }
      }
    }
  }
  return true
}

export const formatFile = file => {
  return {
    ...file,
    ...(file?.id || file?.key
      ? {
          uid: file?.id || file?.key,
          name: file?.name || file?.fileName || file?.filename,
          type: file?.type || file?.mimeType || file?.mimetype,
          status: 'done',
          thumbUrl: file?.baseUrl || file?.thumbUrl,
          url: file?.url
        }
      : {})
  }
}

export const formatFiles = files => {
  return (files || []).map(file => formatFile(file))
}
