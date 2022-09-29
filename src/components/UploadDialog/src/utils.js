const hasImageByType = type => {
  return type.includes('image/')
}

const hasImageByName = name => {
  const suffix = /\.([0-9a-zA-Z]+)$/i.exec(name)?.[1]
  return ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(suffix)
}

const hasImageByUrl = url => {
  return /^.+(\.png|\.jpg|\.jpeg|\.gif|\.bmp)$/.test(url)
}

export const hasImage = file => {
  if (file.type) {
    return hasImageByType(file.type)
  } else if (file.name) {
    return hasImageByName(file.name)
  } else {
    return hasImageByUrl(file.url)
  }
}

export const getFileExpanded = file => {
  return (file.type?.split('/') || file.name?.split('.'))?.[1]?.toUpperCase?.()
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
