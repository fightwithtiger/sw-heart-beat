import type { Message, RegisterProps, WithPartial } from './types'
import { assign } from './utils'

const msgQueue: Message[] = []
let timer: any = null
const MAX_RETRY_COUNT = 3
let retryCount = 0

let isRegistered = false
let commonParams: Record<string, unknown> = {}

function postMessage(message: Message) {
  try {
    const payload = message.payload || {}
    navigator.serviceWorker.controller!.postMessage({
      ...message,
      payload: { ...commonParams, ...payload },
    }, {})
    // eslint-disable-next-line no-console
    console.log('client send', message)
  } catch (err) {
    console.error(err)
  }
}

function sendMessageToSw(message: WithPartial<Message, 'payload'>) {
  if (!navigator.serviceWorker.controller || !isRegistered) {
    msgQueue.push({
      payload: {},
      ...message,
    })
    return
  }

  postMessage({
    payload: {},
    ...message,
  })
}

function flushMessageQueue() {
  while (msgQueue.length) {
    const message = msgQueue.shift()
    if (message) {
      sendMessageToSw(message)
    }
  }
}

function clearTimer() {
  clearInterval(timer)
  timer = null
}

export function subscribe(payload: Record<string, unknown> = {}) {
  sendMessageToSw({
    action: 'subscribe',
    payload,
  })
  return () => {
    sendMessageToSw({
      action: 'unsubscribe',
      payload,
    })
  }
}

const defaultProps = {
  output: '/sw.js',
  scope: '/',
  params: {},
}

export function registerSw(props: RegisterProps = {}) {
  const processedProps = assign(defaultProps, props)
  try {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        initSw(processedProps)
      })
    }
  } catch (err) {
    console.error(err)
  }
}

function initSw(props: Required<RegisterProps>) {
  const { output, scope, params } = props
  navigator.serviceWorker.register(output, {
    scope,
  }).then(() => {
    isRegistered = true
    commonParams = params
    // eslint-disable-next-line no-console
    console.log('service worker registered')
    if (timer) {
      clearTimer()
    }
    timer = setInterval(() => {
      if (navigator.serviceWorker.controller) {
        flushMessageQueue()
        clearTimer()
      } else if (retryCount === MAX_RETRY_COUNT) {
        clearTimer()
        location.reload()
      }
      retryCount++
    }, 2000)
  }).catch((err: any) => {
    console.error(err)
  })

  navigator.serviceWorker.addEventListener('message', (e: any) => {
    const data = e.data || {}
    const { action } = data
    if (action === 'checkHeartbeat') {
      sendMessageToSw({
        action: 'keepHeartbeat',
      })
    }
  })
}
