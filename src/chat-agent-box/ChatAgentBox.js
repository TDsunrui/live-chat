import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import Chat, { Bubble, useMessages, LocaleProvider, ListItem, Modal, CheckboxGroup, Divider, Tag } from '@chatui/core';
import { Menu, Dropdown, Modal as AntModal } from 'antd';
import ClipboardJS from 'clipboard';

import { CHAT_TO, CHAT_ONLINE, CHAT_MESSAGE, IMERROR, CHAT_TO_ACK, CHAT_TO_UNDO, CHAT_TO_READED } from '../client-sdk/constant';
import IOClientSDK from '../client-sdk';
import { createMsgProtocal } from '../client-sdk/protocal';

import '@chatui/core/dist/index.css';
import './chatui-theme.css';

const ChatBox = props => {
  const { uid } = useParams();
  const [videoVisable, setVideoVisable] = useState(false);
  const { messages, appendMsg, updateMsg, deleteMsg, resetList } = useMessages([]);

  const toolbar = [
    { type: 'tel', title: 'Tel', icon: 'tel' },
  ];
  
  const socketRef = useRef();
  const audioRef = useRef();
  const clipboardRef = useRef();
  const messagesRef = useRef();
  messagesRef.current = messages;

  new ClipboardJS('#clipboardBtn', {
    text: () => clipboardRef.current,
  });
  
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([
    { _id: '60ed3176aaa19b57e13e20af', name: 'User' },
    { _id: '60ed3176aaa19b57e13e20ae', name: 'Administrator' },
    { _id: '60ed31e0aaa19b57e13e20ca', name: 'User1' },
  ]);
  const [contactId, setContactId] = useState('60ed31e0aaa19b57e13e20ca');
  const [contactName, setContactName] = useState('User1');

  const [actionId, setActionId] = useState();
  const [actionMessage, setActionMessage] = useState();
  const [forwardContacts, setForwardContacts] = useState([]);
  const [replyMessage, setReplyMessage] = useState();

  const contactOptions = useMemo(() => {
    return contacts
      .filter(item => item.id !== contactId)
      .map(item => ({ label: item.name, value: item.id }));
  }, [contactId, contacts]);

  function renderMessageContent(item) {
    const { content: { content, type, readed = [] }, position, user, _id } = item;

    switch (type) {
      case 1:
        return (
          <Dropdown overlay={genMenu(position)} trigger={['contextMenu']} onContextMenu={() => setActionId(_id)}>
            <div style={{ position: 'relative' }}>
              {position === 'right' && (
                <Tag
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-20px',
                    transform: 'translateY(-50%)'
                }}>
                  {readed.length > 0 ? 'readed' : 'unread'}
                </Tag>
              )}
              
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
          <Dropdown overlay={genMenu(position)} trigger={['contextMenu']} onContextMenu={() => setActionId(_id)}>
            <div style={{ position: 'relative' }}>
              {position === 'right' && (
                <Tag
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-20px',
                    transform: 'translateY(-50%)'
                }}>
                  {readed.length > 0 ? 'readed' : 'unread'}
                </Tag>
              )}
              
              <Bubble type="image">
                <img src={content} alt="" />
              </Bubble>
            </div>
          </Dropdown>
        );
      case 10:
      case 21:
        return (
          <div style={{width: '100%'}}>
            <Divider>{content}</Divider>
          </div>
        );
      default:
        return null;
    }
  }

  function handleSend(type, val) {
    let content;
    
    switch (type) {
      case 'text':
        if (!val.trim()) break;

        content = createMsgProtocal({
          type: 1,
          from: uid,
          to: contactId,
          content: val,
        });
        socketRef.current.emit(CHAT_TO, content);

        appendMsg({
          type: 'text',
          content,
          // user: { replyMessage },
          position: 'right',
          _id: content.fp
        });

        break;
      case 'image':
        content = createMsgProtocal({
          type: 2,
          from: uid,
          to: contactId,
          content: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F7f6dec72221bb589a322e9455d8bb5401ee5552269aa-BdmvBK_fw658&refer=http%3A%2F%2Fhbimg.b0.upaiyun.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628655638&t=89bebf53eb33e14aa430a72443259c3a',
        });
        socketRef.current.emit(CHAT_TO, content);

        appendMsg({
          type: 'image',
          content,
          // user: { replyMessage },
          position: 'right',
          _id: content.fp
        });
        break;
      default:
        break;
    }
  }

  function handleToolbarClick({ type }) {
    if (type === 'tel') {
      setVideoVisable(true);
      setTimeout(() => {
        global.rtcStart('room1', uid);
      }, 1000)
    }
    console.log('handleToolbarClick', type);
  }

  function handleInputTypeChange(inputType) {
    console.log('handleInputTypeChange', inputType);
  }

  function handleClickContact(item) {
    console.log(item)
    localStorage.setItem(contactId, JSON.stringify(messages));
    const { _id, name } = item;
    setContactId(_id);
    setContactName(name);
  }

  function handleMenuAction(action) {
    const curActionMessage = messages.find(item => item._id === actionId);
    setActionMessage(curActionMessage);
    
    switch (action) {
      case 'copy':
        clipboardRef.current = curActionMessage.content.content;
        document.getElementById('clipboardBtn').click();
        break;
      case 'forward':
        setOpen(true);
        break;
      case 'reply':
        setReplyMessage(curActionMessage.content.content);
        break;
      case 'recall':
        socketRef.current.emit(CHAT_TO_UNDO, curActionMessage.content);
        deleteMsg(actionId);
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

  function genMenu(position) {
    return (
      <Menu>
        <Menu.Item key="1" onClick={() => handleMenuAction('copy')}>Copy</Menu.Item>
        {/* <Menu.Item key="2" onClick={() => handleMenuAction('forward')}>Forward</Menu.Item> */}
        {/* <Menu.Item key="3" onClick={() => handleMenuAction('reply')}>Reply</Menu.Item> */}
        {position === 'right' && <Menu.Item key="4" onClick={() => handleMenuAction('recall')}>Recall</Menu.Item>}
        {/* <Menu.Item key="5" onClick={() => handleMenuAction('multi')}>Multi</Menu.Item> */}
      </Menu>
    );
  };

  useEffect(() => {
    socketRef.current = new IOClientSDK({
      root: 'wss://10.198.50.151:7003',
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
      const clients = resp.data.payload.clients.filter(item => item._id !== uid);
      console.log(clients);
      // setContacts();
      // setContactId(clients[0]._id);
      // setContactName(clients[0].name);
    });

    const event2 = socketRef.current.on(CHAT_MESSAGE, (resp) => {
      audioRef.current.play();
      console.log('收到的消息', resp);
      const content = resp.data.payload;
      if ([10, 21].includes(content.type)) {
        deleteMsg(content.fp);
      }
      appendMsg({ content, _id: content.fp });
      socketRef.current.emit(CHAT_TO_READED, resp.data.payload);
    });

    const event3 = socketRef.current.on(CHAT_TO_ACK, (resp) => {
      console.log('发送成功~', resp);
    });

    const event7 = socketRef.current.on(CHAT_TO_READED, (resp) => {
      console.log(resp, '读了我的消息');
      const result = resp.data.payload;
      result.forEach((msg) => {
        const findedMsg = messagesRef.current.find(item => item._id === msg.fp);
        if (!findedMsg) return;
        const content =  { ...findedMsg.content, readed: msg.readed }
        updateMsg(msg.fp, { ...findedMsg, content });
      })
    });

    return function cleanup() {
      errorEvent();
      event1();
      event2();
      event3();
      event7();
    }
  } ,[appendMsg, deleteMsg, uid, updateMsg]);

  useEffect(() => {
    resetList(JSON.parse(localStorage.getItem(contactId) || '[]'));
  }, [contactId, resetList]);

  return (
    <LocaleProvider>
      <audio
        ref={audioRef}
        id="audioId"
        src="https://img.tukuppt.com/newpreview_music/09/00/76/5c894b095237f81946.mp3"
        preload="auto"
        hidden
      />

      <button id="clipboardBtn" hidden></button>

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
              className={`left-item ${contactId === item._id ? 'active' : ''}`}
              key={item._id}
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
      <AntModal width="600px" title="On Call" visible={videoVisable} footer={null} onCancel={() => setVideoVisable(false)}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <video style={{ width: '50%', padding: 8 }} id="remoteVideo" autoPlay playsInline></video>
          <video style={{ width: '50%', padding: 8 }} id="localVideo" autoPlay playsInline muted></video>
        </div>
      </AntModal>
    </LocaleProvider>
  );
};

export default ChatBox;