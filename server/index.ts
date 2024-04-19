import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { socketKeys } from './SocketType'

const app = express()
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

const expressServer = createServer(app)
const socketServer = new Server(expressServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>')
})

const userDatabase = {}

socketServer.on('connection', (socket) => {
  console.log('a user connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
  })

  socket.on(socketKeys.chatMessage, (values) => {
    // 메시지 들어오면 userId와 userName을 저장
    if (userDatabase[values.id] === undefined) {
      // 새로운 userId가 들어오면 클라이언트로 전달
      userDatabase[values.id] = values.name
      socketServer.emit(socketKeys.chatMessage, {
        chatId: `${socket.id}_${new Date().getTime()}`,
        userId: 'notice',
        name: '알림',
        message: `"${userDatabase[values.id]}"님이 입장하셨습니다.`,
      })
    } else {
      // userId의 userName이 바뀌면 클라이언트로 전달
      if (userDatabase[values.id] !== values.name) {
        socketServer.emit(socketKeys.chatMessage, {
          chatId: `${socket.id}_${new Date().getTime()}`,
          userId: 'notice',
          name: '알림',
          message: `"${userDatabase[values.id]}"님이 "${
            values.name
          }"으로 변경되었습니다.`,
        })
        userDatabase[values.id] = values.name
      }
    }

    // 동시에 메시지 전송이 잘 안되어서 시간차를 추가함
    setTimeout(() => {
      console.log('message:', values)
      // 메시지 들어오면 다시 클라이언트로 전달
      socketServer.emit(socketKeys.chatMessage, values)
    }, 100)
  })
})

const PORT = process.env.PORT || 3000
expressServer.listen(PORT, () => {
  console.log(`🎉 server running at http://localhost:${PORT}`)
})
