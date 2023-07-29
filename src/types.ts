export type Action = 'subscribe' | 'unsubscribe' | 'keepHeartbeat'

export interface Message {
  action: Action
  payload: Record<string, unknown>
}

export interface RegisterProps {
  output?: string
  scope?: string
  params?: Record<string, unknown>
}

export type WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface SWPluginOptions {
  output?: string
}
