/**
 * 是否为空
 * @param value
 * @returns {boolean}
 */
export function isEmpty(value: any): boolean {
  if (value == null) {
    return true
  }

  if (isArray(value) || isString(value)) {
    return value.length === 0
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0
  }

  return false
}

export function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

export function isUnDef<T = unknown>(val?: T): val is T {
  return val === undefined
}

export function isNull(val: unknown): val is null {
  return val === null
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val)
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) && isNull(val)
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object')
}

export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val)
}

export function isString(val: unknown): val is string {
  return is(val, 'String')
}

export function isNumber(val: unknown): val is number {
  return is(val, 'Number')
}

export function isBoolean(val: unknown): val is boolean {
  return is(val, 'Boolean')
}

export function isDate(val: unknown): val is Date {
  return is(val, 'Date')
}

export function isSet(val: unknown): val is Map<any, any> {
  return is(val, 'Set')
}

export function isMap(val: unknown): val is Map<any, any> {
  return is(val, 'Map')
}

export function isRegExp(val: unknown): val is RegExp {
  return is(val, 'RegExp')
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export function isWindow(val: any): val is Window {
  return typeof window !== 'undefined' && is(val, 'Window')
}

export function isElement(val: unknown): val is Element {
  return isObject(val) && !!val.tagName
}

export function isBase64(url: string): boolean {
  if (url) {
    return url.startsWith('data:image/')
  }
  return false
}
