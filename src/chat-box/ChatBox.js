import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import Chat, { Bubble, useMessages, LocaleProvider } from '@chatui/core';

import { CHAT_TO, CHAT_ONLINE, CHAT_MESSAGE, IMERROR, CHAT_TO_ACK, CHAT_PULL_RECENT_CONVERSATION, CHAT_PULL_OFFLINE_MESSAGE, CHAT_PULL_HISTORY_MESSAGE, CHAT_TO_READED, CHAT_GROUP_NOTICE, CHAT_TO_TYPING, CHAT_TO_UNDO } from '../client-sdk/constant';
import IOClientSDK from '../client-sdk';
import { createMsgProtocal } from '../client-sdk/protocal';

import '@chatui/core/dist/index.css';
import './chatui-theme.css';

const MsgType = {
  1: 'text',
  2: 'image',
}

const ChatBox = props => {
  const { uid } = useParams();
  const { onClose } = props;
  const { messages, appendMsg, setTyping } = useMessages([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new IOClientSDK({
      root: 'http://localhost:7001',
      nsp: 'chat',
      query: {
        token: global.localStorage.getItem('token'),
        userId: uid,
        deviceType: 'desktop',
      },
    });

    const errorEvent = socketRef.current.on(IMERROR, (resp) => {
      console.error(resp);
    });

    const event1 = socketRef.current.on(CHAT_ONLINE, (resp) => {
      console.log('我上线啦~', resp);
    });

    const event2 = socketRef.current.on(CHAT_MESSAGE, (resp) => {
      console.log('收到的消息', resp);
      const payload = resp.data.payload;
      appendMsg(payload);
    });

    const event3 = socketRef.current.on(CHAT_TO_ACK, (resp) => {
      console.log('发送成功~', resp);
    });

    return function cleanup() {
      errorEvent();
      event1();
      event2();
      event3();
    }
  } ,[]);

  const navBar = {
    title: 'Chat Room',
    leftContent: { icon: 'close', size: 'sm', onClick: onClose },
  };
  const toolbar = [
    { type: 'tel', title: 'Tel', icon: 'tel' },
  ];

  const [inputType, setInputType] = useState('text');

  function handleSend(type, val) {
    switch (type) {
      case 'text':
        if (!val.trim()) break;
        setTyping(true);
        
        const msg = createMsgProtocal({
          type: 1,
          from: uid,
          to: '60ed320faaa19b57e13e20e1',
          content: val,
        });
        socketRef.current.emit(CHAT_TO, msg);

        appendMsg({
          ...msg,
          position: 'right',
        });
  
        break;
      case 'image':
        console.log('file: ', val);
        
        setTyping(true);

        // setTimeout(() => {
        //   appendMsg({
        //     type: 'image',
        //     content: { picUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F7f6dec72221bb589a322e9455d8bb5401ee5552269aa-BdmvBK_fw658&refer=http%3A%2F%2Fhbimg.b0.upaiyun.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628655638&t=89bebf53eb33e14aa430a72443259c3a' }
        //   });
        // }, 1000);
        break;
      default:
        break;
    }
  }

  function renderMessageContent(msg) {
    const { type, content } = msg;
    switch (type) {
      case 1:
        return <Bubble content={content} />;
      case 2:
        return (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        );
      default:
        return null;
    }
  }

  function handleToolbarClick({ type }) {
    console.log(type)
    setInputType(type);
  }

  function handleInputTypeChange(inputType) {
    console.log(inputType);
  }

  return (
    <LocaleProvider>
      <div className="chat-box">
        <Chat
          locale="en-US"
          wideBreakpoint="375px"
          placeholder="types"
          navbar={navBar}
          toolbar={toolbar}
          inputType={inputType}
          messages={messages}
          renderMessageContent={renderMessageContent}
          onSend={handleSend}
          onImageSend={file => handleSend('image', file)}
          onToolbarClick={handleToolbarClick}
          onInputTypeChange={handleInputTypeChange}
        />
      </div>
    </LocaleProvider>
  );
};

export default ChatBox;