import { connect } from 'mqtt';
import {
  IMERROR,
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
    const { root, nsp, ...otherOpts } = this.opts;
    const url = `${root}`;
    this.socket = connect(url, {
      ...otherOpts,
    });
    // pretreatment some reserved event
    // eg: connect, disconnect, error
    this._bindReservedEvent();
  // this._bindChatEvent();
  }

  getSocket() {
    return this.socket;
  }

  closeSocket() {
    return this.socket.end();
  }

  destroy() {
    this.closeSocket();
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
    return this.getSocket().publish(...args);
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
      console.log('connected');
    });

    socket.on('offline', (...resp) => {
      self._execQuene('offline')(...resp);
      console.log(...resp);
    });

    socket.on('close', (...resp) => {
      self._execQuene('close')(...resp);
      console.log(...resp);
    });

    socket.on('error', (error) => {
      self._execQuene('error')(error);
      console.error(error);
    });

    socket.on(IMERROR, (error) => {
      self._execQuene(IMERROR)(error);
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
