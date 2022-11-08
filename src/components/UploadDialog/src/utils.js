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
    const suffix = /\.([0-9a-zA-Z]+)$/i.exec(name)?.[1]
    return ['png', 'jpg', 'jpeg', 'ico', 'gif', 'bmp', 'webp'].includes(suffix)
  }
}

const hasImageByUrl = url => {
  if (url) {
    return /^.+(\.png|\.jpg|\.jpeg|\.ico|\.gif|\.bmp|\.webp)$/.test(url)
  }
}

const getType = file => file?.type || file?.mimeType

const getName = file => file?.name || file?.fileName

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

export const formatFile = file => {
  return {
    ...file,
    ...(file?.id || file?.key
      ? {
          uid: file?.id || file?.key,
          name: file?.name || file?.fileName,
          type: file?.type || file?.mimeType,
          status: 'done',
          thumbUrl: file?.url || file?.thumbUrl,
          url: file?.url
        }
      : {})
  }
}

export const formatFiles = files => {
  return (files || []).map(file => formatFile(file))
}
