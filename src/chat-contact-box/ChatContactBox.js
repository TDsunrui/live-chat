import React, { useRef, useState } from 'react';
import Chat, { Bubble, useMessages, LocaleProvider, ListItem } from '@chatui/core';
import { Menu, Dropdown } from 'antd';
import ClipboardJS from 'clipboard';

import '@chatui/core/dist/index.css';
import './chatui-theme.css';

const ChatBox = props => {
  const { messages, appendMsg, resetList, setTyping } = useMessages([]);

  const toolbar = [
    { type: 'tel', title: 'Tel', icon: 'tel' },
  ];
  const contacts = [
    { id: 1, name: 'Contact1' },
    { id: 2, name: 'Contact2' },
    { id: 3, name: 'Contact3' },
    { id: 4, name: 'Contact4' },
    { id: 5, name: 'Contact5' },
    { id: 6, name: 'Contact6' },
  ];
  
  const audioRef = useRef();
  const clipboardRef = useRef();

  new ClipboardJS('#clipboardBtn', {
    text: () => clipboardRef.current,
  });

  const [contactId, setContactId] = useState(null);
  const [contactName, setContactName] = useState('Chat Room');
  const [actionId, setActionId] = useState();

  function renderMessageContent(msg) {
    const { type, content, _id } = msg;

    switch (type) {
      case 'text':
        return (
          <Dropdown overlay={menu} trigger={['contextMenu']} onContextMenu={() => setActionId(_id)}>
            <div>
              <Bubble content={content.text} />
            </div>
          </Dropdown>
          );
        case 'image':
        return (
          <Dropdown overlay={menu} trigger={['contextMenu']} onContextMenu={() => setActionId(_id)}>
            <div>
              <Bubble type="image">
                <img src={content.picUrl} alt="" />
              </Bubble>
            </div>
          </Dropdown>
        );
      default:
        return null;
    }
  }

  function handleSend(type, val) {
    audioRef.current.play();
    
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

  function handleToolbarClick({ type }) {
    console.log('handleToolbarClick', type);
  }

  function handleInputTypeChange(inputType) {
    console.log('handleInputTypeChange', inputType);
  }

  function handleClickContact(item) {
    localStorage.setItem(contactId, JSON.stringify(messages));
    const { id, name } = item;
    setContactId(id);
    setContactName(name);
    resetList(JSON.parse(localStorage.getItem(id) || '[]'));
  }

  function handleAction(action) {
    switch (action) {
      case 'copy':
        const { text } = messages.find(item => item._id === actionId).content;
        clipboardRef.current = text;
        document.getElementById('clipboardBtn').click();
        break;
      case 'forward':
        console.log('forward: ', );
        break;
      case 'rely':
        console.log('rely: ', );
        break;
      case 'multi':
        break;
      default:
        break;
    }

    setActionId([]);
  }

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => handleAction('copy')}>Copy</Menu.Item>
      <Menu.Item key="2" onClick={() => handleAction('forward')}>Forward</Menu.Item>
      <Menu.Item key="3" onClick={() => handleAction('rely')}>Rely</Menu.Item>
      <Menu.Item key="4" onClick={() => handleAction('multi')}>Multi</Menu.Item>
    </Menu>
  );

  return (
    <LocaleProvider>
      <audio
        ref={audioRef}
        id="audioId"
        src="https://img.tukuppt.com/newpreview_music/09/00/76/5c894b095237f81946.mp3"
        preload="auto"
        hidden
      />

      <button id="clipboardBtn" data-clipboard-text="233333" hidden>2333</button>

      <div className="main-container">
        
        <div className="left-container">
          <ListItem content="Contact" />

          {contacts.map(item => (
            <ListItem
              className={`left-item ${contactId === item.id ? 'active' : ''}`}
              key={item.id}
              content={item.name}
              onClick={() => handleClickContact(item)}
            />
          ))}


        </div>

        <div className="right-container">
          <Chat
            height="100%"
            wideBreakpoint="375px"
            locale="en-US"
            placeholder="types"
            navbar={{ title: contactName }}
            toolbar={toolbar}
            messages={messages}
            renderMessageContent={renderMessageContent}
            onSend={handleSend}
            onImageSend={file => handleSend('image', file)}
            onToolbarClick={handleToolbarClick}
            onInputTypeChange={handleInputTypeChange}
          />
        </div>
      </div>
    </LocaleProvider>
  );
};

export default ChatBox;