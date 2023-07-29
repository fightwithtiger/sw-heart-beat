/* eslint-disable @typescript-eslint/space-before-function-paren */
const CRASH_TIMEOUT = 5000
let timer = null
let subscribers = []
const statusMap = {}
const dataMap = {}

self.addEventListener('install', (event) => {
  // event.waitUtil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  // event.waitUtil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const data = event.data
  const { action, payload = {} } = data
  const sourceId = event.source.id

  // eslint-disable-next-line no-console
  console.log('service received', action, subscribers)
  switch (action) {
    case 'subscribe':
      subscribe(sourceId, payload)
      break
    case 'unsubscribe':
      unsubscribe(sourceId)
      break
    case 'keepHeartbeat':
      keepHeartbeat(sourceId)
      break
    default:
      break
  }
})

function subscribe (sourceId, payload) {
  if (!subscribers.includes(sourceId)) {
    subscribers.push(sourceId)
  }
  statusMap[sourceId] = true
  dataMap[sourceId] = payload
  if (!timer) {
    checkHeartbeat()
  }
}

function unsubscribe (sourceId) {
  statusMap[sourceId] = null
  dataMap[sourceId] = null
  delete statusMap[sourceId]
  delete dataMap[sourceId]
  subscribers = subscribers.filter(i => i !== sourceId)
}

function keepHeartbeat (sourceId) {
  statusMap[sourceId] = true
}

function removeTimer () {
  if (timer) {
    clearInterval(timer)
  }

  timer = null
}

function check () {
  if (subscribers.length === 0) {
    removeTimer()
    return
  }
  sendMessageToSubscribers({ action: 'checkHeartbeat' })
}

function checkHeartbeat () {
  sendMessageToSubscribers({ action: 'checkHeartbeat' })
  timer = setInterval(() => {
    check()
  }, CRASH_TIMEOUT)
}

function sendMessageToSubscribers (msg) {
  // eslint-disable-next-line no-undef
  clients.matchAll().then((clients) => {
    const ids = clients.map(i => i.id)
    subscribers = subscribers.filter(subscriber => ids.includes(subscriber))
    clients.forEach((client) => {
      const sourceId = client.id
      if (!subscribers.includes(sourceId)) {
        return
      }
      if (!statusMap[sourceId]) {
        report(client)
        unsubscribe(sourceId)
        return
      } else {
        statusMap[sourceId] = false
      }

      // eslint-disable-next-line no-console
      console.log('service send', msg)
      client.postMessage(msg)
    })
  })
}

function report (client) {
  console.error('crash', client.url)
  const sourceId = client.id
  const payload = dataMap[sourceId]

  sendData({
    sourceId,
    url: client.url,
    ...payload,
  })
}

function sendData (data) {
  const api = 'https://xxx.aa.com/api/log'
  const headers = new Headers()
  headers.append('Content-Type', 'application/json; charset=utf-8')
  const init = {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  }

  const request = new Request(api, init)
  fetch(request)
}
