// utils
export const IMERROR = 'im_error';

/**
 * namespace: sso
 */
export const SSO = 'sso';

/**
 * PC 端扫码登录
 */
export const SSO_QRLOGIN = 'qrlogin';

/**
 * namespace: chat
 */
export const CHAT = 'chat';

/**
 * 客户端发送消息事件
 */
export const CHAT_TO = 'to';

/**
 * 获取当前在线所有用户
 */
export const CHAT_ONLINE = 'c_online';

/**
 * 客户端接收消息事件
 */
export const CHAT_MESSAGE = 'c_message';

/**
 * 服务端收到消息回执（已发送）
 */
export const CHAT_TO_ACK = 'to_ack';

/**
 * 拉取最近会话列表
 */
export const CHAT_PULL_RECENT_CONVERSATION = 'recent_conversation';

/**
 * 拉取离线消息
 */
export const CHAT_PULL_OFFLINE_MESSAGE = 'offline_message';

/**
 * 客户端收到消息回执（已推送）
 */
export const CHAT_MESSAGE_ACK = 'c_message_ack';

/**
 * 拉取历史消息
 */
export const CHAT_PULL_HISTORY_MESSAGE = 'history_message';

/**
 * 客户端已读回执（已阅读）
 */
export const CHAT_TO_READED = 'to_reader';

/**
 * 群信息变更通知
 */
export const CHAT_GROUP_NOTICE = 'g_notice';

/**
 * 对方输入中状态
 */
export const CHAT_TO_TYPING = 'to_typing';
/**
 * 客户端撤回消息
*/
export const CHAT_TO_UNDO = 'to_undo';
/**
 * 服务端推送已读消息
*/
export const CHAT_PULL_READED_MESSAGE = 'readed_message';
