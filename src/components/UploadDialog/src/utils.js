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

const getType = file => file?.mimeType || file?.type

const getName = file => file?.fileName || file?.name

export const hasImage = file => {
  const type = getType(file)
  const name = getName(file)
  if (type) {
    return hasImageByType(type)
  } else if (name) {
    return hasImageByName(name)
  } else {
    return hasImageByUrl(file.url)
  }
}

export const getFileExpanded = file => {
  const type = getType(file)
  if (type) {
    return type?.split('/')?.[1]?.toUpperCase?.()
  }
  const name = getName(file)
  if (name) {
    const list = name?.split('.')
    return list?.[list.length - 1]?.toUpperCase?.()
  }
}

export const formatFiles = files => {
  return (files || []).map(val => {
    return {
      ...val,
      ...(val?.id || val?.key
        ? {
            uid: val?.id || val?.key,
            name: val?.fileName || val?.name,
            type: val?.mimeType || val?.type,
            status: 'done',
            thumbUrl: val?.url || val?.thumbUrl,
            url: val?.url
          }
        : {})
    }
  })
}
