import styled from '@emotion/styled'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { MessageType, socketKeys } from '../server/SocketType'

const socketClient = io('http://localhost:3000')
console.log('# socketClient:', socketClient)

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [chattings, setChattings] = useState<MessageType[]>([])

  useEffect(() => {
    socketClient.on(socketKeys.message, (values: MessageType) => {
      setChattings((prevMessages) => [...prevMessages, values])
    })
    return () => {
      socketClient.off(socketKeys.message)
    }
  }, [])

  useEffect(() => {
    // messages가 변경되면 스크롤
    window.scrollTo(0, document.body.scrollHeight)
  }, [chattings])

  return (
    <StyledAppDiv>
      <ul id="messages">
        {chattings.map((chat) => (
          <li key={chat.message}>
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
            socketClient.emit(socketKeys.message, {
              id: socketClient.id,
              name: socketClient.id,
              message: inputRef.current.value,
            })
            console.log('message:', inputRef.current.value)
            inputRef.current.value = ''
          }
        }}
      >
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
