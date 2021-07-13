import React, { useState } from 'react';
import Chat, { Bubble, useMessages, LocaleProvider } from '@chatui/core';

import '@chatui/core/dist/index.css';
import './chatui-theme.css';

const ChatBox = props => {
  const { onClose } = props;
  const { messages, appendMsg, setTyping } = useMessages([]);

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

        appendMsg({
          type: 'text',
          content: { text: val },
          position: 'right',
        });
  
        setTyping(true);

        setTimeout(() => {
          appendMsg({
            type: 'text',
            content: { text: 'Bala bala' },
          });
        }, 1000);
        break;
      case 'image':
        console.log('file: ', val);
        
        setTyping(true);

        setTimeout(() => {
          appendMsg({
            type: 'image',
            content: { picUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F7f6dec72221bb589a322e9455d8bb5401ee5552269aa-BdmvBK_fw658&refer=http%3A%2F%2Fhbimg.b0.upaiyun.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628655638&t=89bebf53eb33e14aa430a72443259c3a' }
          });
        }, 1000);
        break;
      default:
        break;
    }
  }

  function renderMessageContent(msg) {
    const { type, content } = msg;

    switch (type) {
      case 'text':
        return <Bubble content={content.text} />;
      case 'image':
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