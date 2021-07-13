import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import Chat, { Bubble, useMessages, LocaleProvider, ListItem, Modal, CheckboxGroup, Divider } from '@chatui/core';
import { Menu, Dropdown } from 'antd';
import ClipboardJS from 'clipboard';

import { CHAT_TO, CHAT_ONLINE, CHAT_MESSAGE, IMERROR, CHAT_TO_ACK } from '../client-sdk/constant';
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
  
  const { messages, appendMsg, resetList, setTyping } = useMessages([]);

  const toolbar = [
    { type: 'tel', title: 'Tel', icon: 'tel' },
  ];
  const defaultContacts = [
    { id: '60ed31e0aaa19b57e13e20ca', name: 'Contact1' },
    { id: 2, name: 'Contact2' },
    { id: 3, name: 'Contact3' },
    { id: 4, name: 'Contact4' },
    { id: 5, name: 'Contact5' },
    { id: 6, name: 'Contact6' },
  ];
  
  const socketRef = useRef();
  const audioRef = useRef();
  const clipboardRef = useRef();

  new ClipboardJS('#clipboardBtn', {
    text: () => clipboardRef.current,
  });
  
  const [open, setOpen] = useState(false);

  const [contacts, setContacts] = useState(defaultContacts);
  const [contactId, setContactId] = useState(defaultContacts[0]?.id);
  const [contactName, setContactName] = useState('Chat Room');

  const [actionId, setActionId] = useState();
  const [actionMessage, setActionMessage] = useState();
  const [forwardContacts, setForwardContacts] = useState([]);
  const [replyMessage, setReplyMessage] = useState();

  const contactOptions = useMemo(() => {
    return contacts
      .filter(item => item.id !== contactId)
      .map(item => ({ label: item.name, value: item.id }));
  }, [contactId, contacts]);

  function renderMessageContent(msg) {
    const { type, content, user, _id } = msg;

    switch (type) {
      case 1:
        return (
          <Dropdown overlay={menu} trigger={['contextMenu']} onContextMenu={() => setActionId(_id)}>
            <div>
              <Bubble>
                {content}
                {user.replyMessage && (
                  <>
                    <Divider/>
                    Reply to: {user.replyMessage}
                  </>
                )}
              </Bubble>
            </div>
          </Dropdown>
          );
      case 2:
      return (
        <Dropdown overlay={menu} trigger={['contextMenu']} onContextMenu={() => setActionId(_id)}>
          <div>
            <Bubble type="image">
              <img src={content} alt="" />
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
    let msg;
    
    switch (type) {
      case 'text':
        if (!val.trim()) break;

        msg = createMsgProtocal({
          type: 1,
          from: uid,
          to: contactId,
          content: val,
        });
        socketRef.current.emit(CHAT_TO, msg);

        appendMsg({
          ...msg,
          // type: 'text',
          // content: { text: val },
          // user: { replyMessage },
          position: 'right',
        });
        break;
      case 'image':
        msg = createMsgProtocal({
          type: 2,
          from: uid,
          to: contactId,
          content: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F7f6dec72221bb589a322e9455d8bb5401ee5552269aa-BdmvBK_fw658&refer=http%3A%2F%2Fhbimg.b0.upaiyun.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628655638&t=89bebf53eb33e14aa430a72443259c3a',
        });
        socketRef.current.emit(CHAT_TO, msg);

        appendMsg({
          ...msg,
          // type: 'text',
          // content: { text: val },
          // user: { replyMessage },
          position: 'right',
        });
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
  }

  function handleMenuAction(action) {
    const curActionMessage = messages.find(item => item._id === actionId);
    setActionMessage(curActionMessage);
    
    switch (action) {
      case 'copy':
        clipboardRef.current = curActionMessage.content;
        document.getElementById('clipboardBtn').click();
        break;
      case 'forward':
        setOpen(true);
        break;
      case 'reply':
        setReplyMessage(curActionMessage.content);
        break;
      case 'multi':
        break;
      default:
        break;
    }
  }

  function resetAction() {
    setActionId();
    setActionMessage();
    setForwardContacts([]);
  }

  useEffect(() => {
    socketRef.current = new IOClientSDK({
      root: 'http://10.198.62.218:7001',
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
  } ,[appendMsg, uid]);

  useEffect(() => {
    resetList(JSON.parse(localStorage.getItem(contactId) || '[]'));
  }, [contactId, resetList]);

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => handleMenuAction('copy')}>Copy</Menu.Item>
      <Menu.Item key="2" onClick={() => handleMenuAction('forward')}>Forward</Menu.Item>
      <Menu.Item key="3" onClick={() => handleMenuAction('reply')}>Reply</Menu.Item>
      <Menu.Item key="4" onClick={() => handleMenuAction('multi')}>Multi</Menu.Item>
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

      <Modal
        active={open}
        title="Forward"
        showClose={false}
        backdrop="static"
        actions={[
          {
            label: 'Confirm',
            color: 'primary',
            onClick: () => {
              console.log('forward:', actionMessage, 'to:', forwardContacts);
              setOpen(false);
              resetAction();
            },
          },
          {
            label: 'Back',
            onClick: () => {
              setOpen(false);
              resetAction();
            },
          },
        ]}
      >
        <div style={{ padding: '0 15px' }}>
          <CheckboxGroup
            options={contactOptions}
            value={forwardContacts}
            block
            onChange={(value) => setForwardContacts(value)}
          />
        </div>
      </Modal>

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