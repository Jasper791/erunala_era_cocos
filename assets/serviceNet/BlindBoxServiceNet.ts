import LogUtils from "../common/util/LogUtils";
import { CmdDataModel, BlindBoxCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import { decodeResponseProto } from "./protocol/ResponseProto";
import ServiceNetBasic from "./ServiceNetBasic";

/**
 * 盲盒业务网络层
 *
 * 开盲盒流程说明（已与需求方确认）：
 *   开盒动作发生在 **链上合约**（玩家在前端直接调合约开盒），
 *   合约随机发奖后由扫链程序落库到服务端的 blindbox_open_log 表。
 *   因此客户端与服务端之间 **不存在"开盒"请求**，
 *   服务端只提供「盲盒列表 / 购买记录 / 开盒记录」三类查询。
 *
 * 故本类不提供 heroBlindBox / elvesBlindBox / armsBlindBox / propBlindBox
 * 这类"请求服务端开盒"的方法（服务端也无对应 Action）。
 * UI 层开盒应直接走 LinkKit 调链上合约，开盒后调用 queryOpenLogPage 刷新结果。
 */
export default class BlindBoxServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 盲盒箱子列表（最近一次 queryBoxList 结果） */
  public static boxList: any[] = [];
  /** 购买记录分页（最近一次 queryPurchaseLogPage 结果） */
  public static purchaseLogPage: any = null;
  /** 开盒记录分页（最近一次 queryOpenLogPage 结果） */
  public static openLogPage: any = null;

  /** 注册查询响应处理器（幂等） */
  public static registerHandlers(): void {
    if (BlindBoxServiceNet.registered) return;
    BlindBoxServiceNet.registered = true;

    HandleMgr.addHandler(CmdDataModel.BlindBoxCmd, BlindBoxCmd.QueryBoxList, (data: Uint8Array) => {
      const list = BlindBoxServiceNet.parseJsonList(data, "queryBoxList");
      if (list) BlindBoxServiceNet.boxList = list;
    });

    HandleMgr.addHandler(CmdDataModel.BlindBoxCmd, BlindBoxCmd.QueryPurchaseLogPage, (data: Uint8Array) => {
      const page = BlindBoxServiceNet.parseJsonObj(data, "queryPurchaseLogPage");
      if (page) BlindBoxServiceNet.purchaseLogPage = page;
    });

    HandleMgr.addHandler(CmdDataModel.BlindBoxCmd, BlindBoxCmd.QueryOpenLogPage, (data: Uint8Array) => {
      const page = BlindBoxServiceNet.parseJsonObj(data, "queryOpenLogPage");
      if (page) BlindBoxServiceNet.openLogPage = page;
    });
  }

  private static parseJsonList(data: Uint8Array, tag: string): any[] | null {
    try {
      const res = decodeResponseProto(data);
      if (!res.success) {
        LogUtils.warn(`[BlindBox] ${tag} 失败:`, res.msg);
        return null;
      }
      const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      LogUtils.error(`[BlindBox] ${tag} 解析失败:`, e);
      return null;
    }
  }

  private static parseJsonObj(data: Uint8Array, tag: string): any | null {
    try {
      const res = decodeResponseProto(data);
      if (!res.success) {
        LogUtils.warn(`[BlindBox] ${tag} 失败:`, res.msg);
        return null;
      }
      return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    } catch (e) {
      LogUtils.error(`[BlindBox] ${tag} 解析失败:`, e);
      return null;
    }
  }

  /** 查询盲盒箱子列表（含奖品池） */
  public static queryBoxList(): void {
    BlindBoxServiceNet.registerHandlers();
    this.query(CmdDataModel.BlindBoxCmd, BlindBoxCmd.QueryBoxList, "查询盲盒箱子列表");
  }

  /** 查询当前玩家的购买记录（分页参数走服务端默认/或后续扩展 Data） */
  public static queryPurchaseLogPage(): void {
    BlindBoxServiceNet.registerHandlers();
    this.query(CmdDataModel.BlindBoxCmd, BlindBoxCmd.QueryPurchaseLogPage, "查询购买记录");
  }

  /** 查询当前玩家的开盒记录（扫链落库后的结果） */
  public static queryOpenLogPage(): void {
    BlindBoxServiceNet.registerHandlers();
    this.query(CmdDataModel.BlindBoxCmd, BlindBoxCmd.QueryOpenLogPage, "查询开盒记录");
  }
}
