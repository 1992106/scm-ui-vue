import { Modal } from 'ant-design-vue'
import { download } from '@src/utils'

/**
 * 导入文件
 * @param fn
 * @param option
 * @param callback
 * @returns {Promise<void>}
 */
const importFile = async (fn, option = {}, callback) => {
  const formData = new FormData()
  formData.append('file', option.file)
  const [err, data] = await fn(formData, { $msg: 'none', $errorMsg: 'none' })
  if (!err) {
    Modal.success({
      title: '导入成功',
      content: data,
      onOk: callback || (() => Promise.resolve())
    })
  } else {
    Modal.error({
      title: '导入失败',
      content: (
        <div>
          {err?.msg}
          {err?.data && (
            <div onClick={() => download(err?.data)}>
              <a>下载失败文件</a>
            </div>
          )}
        </div>
      )
    })
  }
}

export { importFile }
