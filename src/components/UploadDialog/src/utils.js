const hasImageByType = type => {
  return type.includes('image/')
}

const hasImageByName = name => {
  const suffix = /\.([0-9a-zA-Z]+)$/i.exec(name)?.[1]
  return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(suffix)
}

const hasImageByUrl = url => {
  return /^.+(\.png|\.jpg|\.jpeg|\.gif|\.bmp|\.webp)$/.test(url)
}

const getType = file => file?.type || file?.mimeType

const getName = file => file?.name || file?.fileName

export const hasImage = file => {
  const type = getType(file)
  const name = getName(file)
  return hasImageByType(type) || hasImageByName(name) || hasImageByUrl(file.url)
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

export const formatFiles = files => {
  return (files || []).map(val => {
    return {
      ...val,
      ...(val?.id || val?.key
        ? {
            uid: val?.id || val?.key,
            name: val?.name || val?.fileName,
            type: val?.type || val?.mimeType,
            status: 'done',
            thumbUrl: val?.url || val?.thumbUrl,
            url: val?.url
          }
        : {})
    }
  })
}
