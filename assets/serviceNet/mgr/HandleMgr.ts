import LogUtils from "../../common/util/LogUtils";
import { decodeResponseProto } from "../protocol/ResponseProto";
import {
  ArmsCmd,
  BattleCmd,
  BlindBoxCmd,
  ChainBizCmd,
  CmdDataModel,
  ElvesCmd,
  HeroCmd,
  LoginCmd,
  MarketCmd,
  MiningCmd,
  PropCmd,
  PveBattleCmd,
  SystemCmd,
  TradeTypeCmd,
} from "./CmdData";
import CmdMgr from "./CmdMgr";

// 消息处理函数
export type MessageHandler = (data: Uint8Array) => void;

// 各业务模型的子命令枚举
const MODEL_SUBCMDS: { [cmd: number]: object } = {
  [CmdDataModel.LoginCmd]: LoginCmd,
  [CmdDataModel.HeroCmd]: HeroCmd,
  [CmdDataModel.ElvesCmd]: ElvesCmd,
  [CmdDataModel.ArmsCmd]: ArmsCmd,
  [CmdDataModel.PropCmd]: PropCmd,
  [CmdDataModel.MarketCmd]: MarketCmd,
  [CmdDataModel.TradeTypeCmd]: TradeTypeCmd,
  [CmdDataModel.ChainBizCmd]: ChainBizCmd,
  [CmdDataModel.BlindBoxCmd]: BlindBoxCmd,
  [CmdDataModel.MiningCmd]: MiningCmd,
  [CmdDataModel.BattleCmd]: BattleCmd,
  [CmdDataModel.PveBattleCmd]: PveBattleCmd,
  [CmdDataModel.SystemCmd]: SystemCmd,
};

// 各业务模型的解码函数
// 除 LoginCmd 外，其余服务的 Action 均通过 ResponseUtil.responseProto() 返回，统一用 decodeResponseProto 解码
const MODEL_DECODERS: { [cmd: number]: (data: Uint8Array) => any } = {
  [CmdDataModel.LoginCmd]: decodeResponseProto,
  [CmdDataModel.HeroCmd]: decodeResponseProto,
  [CmdDataModel.ElvesCmd]: decodeResponseProto,
  [CmdDataModel.ArmsCmd]: decodeResponseProto,
  [CmdDataModel.PropCmd]: decodeResponseProto,
  [CmdDataModel.MarketCmd]: decodeResponseProto,
  [CmdDataModel.TradeTypeCmd]: decodeResponseProto,
  [CmdDataModel.ChainBizCmd]: decodeResponseProto,
  [CmdDataModel.BlindBoxCmd]: decodeResponseProto,
  [CmdDataModel.MiningCmd]: decodeResponseProto,
  [CmdDataModel.BattleCmd]: decodeResponseProto,
  [CmdDataModel.PveBattleCmd]: decodeResponseProto,
  [CmdDataModel.SystemCmd]: decodeResponseProto,
};

// 取数值枚举的全部成员值（过滤反向映射的字符串键）
function enumValues(e: object): number[] {
  const result: number[] = [];
  for (const key of Object.keys(e)) {
    const v = (e as any)[key];
    if (typeof v === "number") result.push(v);
  }
  return result;
}

export default class HandleMgr {
  private static handlers: Map<number, MessageHandler> = new Map();
  private static inited: boolean = false;

  // 一次性注册全部协议处理（登录入口调用一次）
  public static init(): void {
    if (HandleMgr.inited) return;
    HandleMgr.inited = true;
    for (const cmd of Object.keys(MODEL_SUBCMDS).map(Number)) {
      const decode = MODEL_DECODERS[cmd];
      for (const subCmd of enumValues(MODEL_SUBCMDS[cmd])) {
        HandleMgr.addHandler(cmd, subCmd, (data) => {
          LogUtils.log(`响应 cmd=${cmd} subCmd=${subCmd}`, decode(data));
        });
      }
    }
  }

  // 注册回调
  public static addHandler(cmd: number, subCmd: number, handler: MessageHandler): void {
    const key = CmdMgr.getMergeCmd(cmd, subCmd);
    HandleMgr.handlers.set(key, handler);
  }

  // 消息分发
  public static packageHandler(cmd: number, subCmd: number, data: Uint8Array): void {
    // cmd=0 为心跳包，无需分发
    if (cmd === 0) return;
    const key = CmdMgr.getMergeCmd(cmd, subCmd); const handler = HandleMgr.handlers.get(key);
    if (handler) {
      handler(data);
    } else {
      LogUtils.warn(`[HandleMgr] handler is null cmd=${cmd} subCmd=${subCmd} key=0x${key.toString(16)}`);
    }
  }
}