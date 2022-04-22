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
  const res = await fn(formData, { $msg: 'none', $errorMsg: 'none' })
  if (res?.status === 200) {
    Modal.success({
      title: '导入成功',
      content: res?.msg,
      onOk: callback || (() => Promise.resolve())
    })
  } else {
    Modal.error({
      title: '导入失败',
      content: (
        <div>
          {res?.msg}
          {res?.data && (
            <div onClick={() => download(res?.data)}>
              <a>下载失败文件</a>
            </div>
          )}
        </div>
      )
    })
  }
}

export { importFile }
