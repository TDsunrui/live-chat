import _uniqWith from 'lodash.uniqwith';

export const protocal = {};

export const uuid = (len = 10) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < len; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const uniq = (list) => _uniqWith(list.filter((i) => i), (b, a) => {
  if (!a.fp || !b.fp) return false;
  if (a.type === 10 || b.type === 10) return false;
  return a.fp === b.fp;
});

export const generateTimelineId = (from, to) => `${from}@${to}`;

/*
* @param type:number 消息类型 1: 文本消息 2: 图片消息 3: 语音消息 10: 被撤回的消息  11: 合并的消息 21: 被撤回的非文本消息
* @param from:string 消息发送者 uid
* @param to:string 消息接收者 uid
* @param content:string 要发送的数据内容
* @param fingerPrint:string 消息包的指纹码（即唯一ID），本参数为空时函数将自动生成 uuid 作为 fingerprint, 否则使用入参
* @param typeu:any 应用层专用字段 1: c2c 消息 2: c2g 消息 3: 系统消息 4: 公告消息
* @param time:number 消息的发出时间，本字段目前用于聊天消息记录时，可为空
*/
export const createMsgProtocal = ({
  type,
  from,
  to,
  content,
  fingerPrint = uuid(30),
  typeu = 1,
}) => ({
  type,
  from,
  to,
  content,
  fp: fingerPrint,
  typeu,
  time: Date.now(),
});
