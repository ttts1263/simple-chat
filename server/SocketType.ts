export const socketKeys = {
  chatMessage: 'chatMessage',
}

export type ChatMessageType = {
  chatId: string
  userId: string
  name: string
  message: string
}
