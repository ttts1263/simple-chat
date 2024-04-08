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

socketServer.on('connection', (socket) => {
  console.log('a user connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
  })

  socket.on(socketKeys.message, (values) => {
    console.log('message:', values)
    socketServer.emit(socketKeys.message, values)
  })
})

const PORT = process.env.PORT || 3000
expressServer.listen(PORT, () => {
  console.log(`🎉 server running at http://localhost:${PORT}`)
})
