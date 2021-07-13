/* eslint-disable no-underscore-dangle */
import io from 'socket.io-client';
import {
  IMERROR,
  SSO_QRLOGIN,
  CHAT_TO,
  CHAT_ONLINE,
  CHAT_MESSAGE,
  CHAT_MESSAGE_ACK,
  CHAT_TO_ACK,
  CHAT_PULL_RECENT_CONVERSATION,
  CHAT_PULL_OFFLINE_MESSAGE,
  CHAT_PULL_HISTORY_MESSAGE,
  CHAT_TO_READED,
  CHAT_GROUP_NOTICE,
  CHAT_TO_TYPING,
  CHAT_TO_UNDO,
  CHAT_PULL_READED_MESSAGE,
} from './constant';

class IOClientSDK {
  constructor(options) {
    this.socket = null;
    this.opts = options;
    this.callback = {};
    this.initialize();
  }

  initialize() {
    // io is a Manager instance
    // io options reference Manager
    // https://socket.io/docs/client-api/#new-Manager-url-options
    const { root, nsp, ...otherOpts } = this.opts;
    const url = `${root}/${nsp}`;
    this.socket = io(url, {
      path: '/ws', // matching with server
      transports: ['websocket'],
      ...otherOpts,
    });
    // pretreatment some reserved event
    // eg: connect, disconnect, error
    this._bindReservedEvent();
    if (nsp === 'sso') this._bindSSOEvent();
    if (nsp === 'chat') this._bindChatEvent();
  }

  getSocket() {
    return this.socket;
  }

  openSocket() {
    return this.socket.open();
  }

  closeSocket() {
    return this.socket.close();
  }

  destroySocket() {
    return this.socket.destroy();
  }

  destroy() {
    this.destroySocket();
    this.socket = null;
    this.callback = null;
  }

  on(eventName, cb) {
    if (typeof cb !== 'function') throw new Error(`[Client Error 400] '${eventName}' callback ${cb} is not a Function`);
    if (!Array.isArray(this.callback[eventName])) this.callback[eventName] = [];
    const self = this;
    self.callback[eventName].push(cb);
    return function off() {
      const index = self.callback[eventName].indexOf(cb);
      self.callback[eventName].splice(index, 1);
    };
  }

  once(eventName, cb) {
    if (typeof cb !== 'function') throw new Error(`[Client Error 400] '${eventName}' callback ${cb} is not a Function`);
    const me = this.on(eventName, (params) => {
      cb(params);
      me();
    });
  }

  emit(...args) {
    return this.getSocket().emit(...args);
  }

  _execQuene(eventName) {
    const quene = this.callback[eventName];
    if (!Array.isArray(quene)) return () => {};
    return (params) => {
      quene.forEach((cb) => {
        if (typeof cb === 'function') {
          cb(params);
        }
      });
    };
  }

  _bindReservedEvent() {
    const socket = this.getSocket();
    const self = this;
    socket.on('connect', (...resp) => {
      self._execQuene('connect')(...resp);
      // feat: 拉取离线消息
      self.emit(CHAT_PULL_OFFLINE_MESSAGE);
      // feat: 拉取离线已读回执
      self.emit(CHAT_PULL_READED_MESSAGE);
    });

    socket.on('disconnect', (...resp) => {
      self._execQuene('disconnect')(...resp);
      console.log(...resp);
    });

    socket.on('error', (error) => {
      self._execQuene('error')(error);
      throw new Error(`[Socket Error 500] ${error}`);
    });

    socket.on(IMERROR, (error) => {
      self._execQuene(IMERROR)(error);
    });
  }

  _bindSSOEvent() {
    const socket = this.getSocket();
    const self = this;
    socket.on(SSO_QRLOGIN, (...resp) => {
      self._execQuene(SSO_QRLOGIN)(...resp);
      // feat: 成功登录后销毁连接
      self.destroySocket();
    });
  }

  _bindChatEvent() {
    const socket = this.getSocket();
    const self = this;

    // Emit Event
    socket.on(CHAT_TO, (...resp) => {
      self._execQuene(CHAT_TO)(...resp);
    });

    socket.on(CHAT_TO_UNDO, (...resp) => {
      self._execQuene(CHAT_TO_UNDO)(...resp);
    });

    /**
     * Subscription Event
     */
    socket.on(CHAT_ONLINE, (...resp) => {
      self._execQuene(CHAT_ONLINE)(...resp);
    });

    socket.on(CHAT_MESSAGE, (...resp) => {
      self._execQuene(CHAT_MESSAGE)(...resp);
      const msg = resp[0];
      if (msg.code === 0) {
        // feat: 确认客户端已收到消息
        self.emit(CHAT_MESSAGE_ACK, msg.data.payload);
      }
    });

    socket.on(CHAT_TO_ACK, (...resp) => {
      self._execQuene(CHAT_TO_ACK)(...resp);
    });

    socket.on(CHAT_PULL_RECENT_CONVERSATION, (...resp) => {
      self._execQuene(CHAT_PULL_RECENT_CONVERSATION)(...resp);
    });

    socket.on(CHAT_PULL_OFFLINE_MESSAGE, (...resp) => {
      self._execQuene(CHAT_PULL_OFFLINE_MESSAGE)(...resp);
      const msg = resp[0];
      if (msg.code === 0) {
        // feat: 确认客户端已收到所有离线消息
        self.emit(CHAT_MESSAGE_ACK, { data: msg.data.payload });
      }
    });

    socket.on(CHAT_PULL_HISTORY_MESSAGE, (...resp) => {
      self._execQuene(CHAT_PULL_HISTORY_MESSAGE)(...resp);
    });

    socket.on(CHAT_TO_READED, (...resp) => {
      self._execQuene(CHAT_TO_READED)(...resp);
    });

    socket.on(CHAT_GROUP_NOTICE, (...resp) => {
      self._execQuene(CHAT_GROUP_NOTICE)(...resp);
    });

    socket.on(CHAT_TO_TYPING, (...resp) => {
      self._execQuene(CHAT_TO_TYPING)(...resp);
    });
  }
}

export default IOClientSDK;
