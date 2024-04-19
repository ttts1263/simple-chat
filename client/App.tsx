import styled from '@emotion/styled'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { ChatMessageType, socketKeys } from '../server/SocketType'

export default function App() {
  const socketClient = io('http://localhost:3000')

  const inputRef = useRef<HTMLInputElement>(null)

  const [userName, setUserName] = useState('닉네임')
  const [chattings, setChattings] = useState<ChatMessageType[]>([])

  useEffect(() => {
    socketClient.on(socketKeys.chatMessage, (values: ChatMessageType) => {
      console.log('# getMessage', values)
      setChattings((prevMessages) => [...prevMessages, values])
    })
    return () => {
      socketClient.off(socketKeys.chatMessage)
    }
  }, [socketClient])

  useEffect(() => {
    // messages가 변경되면 스크롤
    window.scrollTo(0, document.body.scrollHeight)
  }, [chattings])

  return (
    <StyledAppDiv>
      <ul id="messages">
        {chattings.map((chat) => (
          <li key={chat.chatId}>
            {chat.name}: {chat.message}
          </li>
        ))}
      </ul>

      <form
        id="form"
        onSubmit={(e) => {
          e.preventDefault() // form 새로고침되지 않도록 막기
          if (!inputRef.current) {
            return
          }
          if (inputRef.current.value) {
            socketClient.emit(socketKeys.chatMessage, {
              chatId: `${socketClient.id}_${new Date().getTime()}`,
              userId: socketClient.id,
              name: userName,
              message: inputRef.current.value,
            })
            console.log('message:', inputRef.current.value)
            inputRef.current.value = ''
          }
        }}
      >
        <input
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value)
          }}
        />
        <input ref={inputRef} id="input" name="message" autoComplete="off" />
        <button>Send</button>
      </form>
    </StyledAppDiv>
  )
}

const StyledAppDiv = styled.div`
  margin: 0;
  padding-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif;

  #form {
    background: rgba(0, 0, 0, 0.15);
    padding: 0.25rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 3rem;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
  }
  #input {
    border: none;
    padding: 0 1rem;
    flex-grow: 1;
    border-radius: 2rem;
    margin: 0.25rem;
  }
  #input:focus {
    outline: none;
  }
  #form > button {
    background: #333;
    border: none;
    padding: 0 1rem;
    margin: 0.25rem;
    border-radius: 3px;
    outline: none;
    color: #fff;
  }

  #messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  #messages > li {
    padding: 0.5rem 1rem;
  }
  #messages > li:nth-child(odd) {
    background: #efefef;
  }
`
