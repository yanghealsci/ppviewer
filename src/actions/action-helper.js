import {appLogger} from 'utils'
import 'whatwg-fetch'

export const logger = appLogger.getLogger('Action')

export const errorCode = {
  OK: '000000'
}

/* action helper functions */
export const checkStatus = (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return parseJSON(resp)
        .then(checkSystemError)
  } else {
    throw new Error(resp.status + ' ' + resp.statusText)
  }
}

export const parseJSON = (resp) => {
  return resp.json()
}

export const checkSystemError = (resp) => {
  if (!resp.status || resp.status.code === errorCode.OK) {
    return resp
  } else {
    logger.error(`${resp.status.code} ${resp.status.message} ${resp.status.userMessage}`)
    throw Error(resp.status.code)
  }
}

/**
 * Convert json to x-www-form-urlencoded query string
 */
export const jsonToParamStr = (json) => {
  let result = ''
  result = _.map(json, (val, key) => {
    return `${key}=${val === undefined || val === null ? '' : val}&`
  })
  .join('')

  if (result[result.length - 1] === '&') {
    result = result.slice(0, result.length - 1)
  }
  return result
}

