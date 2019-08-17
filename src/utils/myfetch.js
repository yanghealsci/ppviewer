import qs from 'qs'
import 'es6-promise'
import 'whatwg-fetch'
// import store from 'store'

export default function myfetch ({ url, data, method = 'GET', headers = {}, dataType, cookie = true }) {
  if (!url) {
    throw new Error('url is not defined!')
  }
  let fullUrl = url.indexOf('http') === 0
    ? url
    : url.indexOf('/') === 0 ? `${url}` : `/${url}`
  let options = {
    method: method.toUpperCase()
  }
  if (cookie) {
    options = {
      ...options
      // credentials: 'include'
    }
  }
  if ((options.method === 'GET' || options.method === 'PUT') && dataType !== 'json') {
    data && (fullUrl += `?${qs.stringify(data)}`)
    options = {
      headers: {
        ...options.headers
      }
    }
  } else {
    options = {
      ...options,
      body: qs.stringify(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers
      }
    }
  }
  if (dataType === 'json') {
    options = {
      ...options,
      body: JSON.stringify(data),
      headers: {
        ...options.headers,
        'Content-Type': 'application/json'
      }
    }
  }

  // add token
  // const user = store.getState().oidcUser
  // options.headers.authorization = `Bear ${user.accessToken}`

  const p = Promise.race([
    fetch(fullUrl, options),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('网络加载超时')), 20000)
    })
  ])
  return p.then((response) => {
    if (response.status === 401 || response.status === 400) {
      throw new Error(response.status)
    } else if (response.status === 599) {
      // custormised server error
      return response.json()
    } else if (
      (response.status > 299 || response.status < 200) &&
      response.status !== 304
    ) {
      throw new Error('服务繁忙，请稍后再试')
    }
    return response.json()
  })
  // .then((json) => {
  //   if (json.status && json.status.code !== '000000') {
  //     throw json.status
  //   } else {
  //     return json
  //   }
  // })
  .then((json) => {
    return json
  })
  .catch(error => {
    console.error()
    throw error
  })
}
