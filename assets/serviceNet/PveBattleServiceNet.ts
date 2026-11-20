import LogUtils from "../common/util/LogUtils";
import { CmdDataModel, PveBattleCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import { decodeResponseProto } from "./protocol/ResponseProto";
import ServiceNetBasic from "./ServiceNetBasic";
import {
  PveBattleEventBus,
  PveBattleEventName,
  PveBattleState,
  PveBattleEnd,
  PveRoundResult,
} from "./pve/PveBattleEvent";

export default class PveBattleServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /**
   * 注册 PVE 战斗消息处理器（含服务端主动推送 200/201）。
   * 幂等，可重复调用。
   */
  public static registerHandlers(): void {
    if (PveBattleServiceNet.registered) return;
    PveBattleServiceNet.registered = true;

    // ---- 服务端主动推送：每回合攻击结果 ----
    HandleMgr.addHandler(
      CmdDataModel.PveBattleCmd,
      PveBattleCmd.RoundResultPush,
      (data: Uint8Array) => {
        try {
          const res = decodeResponseProto(data);
          LogUtils.log("[PVE] roundResultPush:", res);
          if (!res.success) {
            PveBattleServiceNet.handleServerError(res);
            return;
          }
          const payload: PveRoundResult =
            typeof res.data === "string" ? JSON.parse(res.data) : (res.data as any);
          PveBattleState.applyRoundResult(payload);
          PveBattleEventBus.emit(PveBattleEventName.RoundResult, payload);
        } catch (e) {
          LogUtils.error("[PVE] roundResultPush 解析失败:", e);
        }
      }
    );

    // ---- 服务端主动推送：战斗结束 ----
    HandleMgr.addHandler(
      CmdDataModel.PveBattleCmd,
      PveBattleCmd.BattleEndPush,
      (data: Uint8Array) => {
        try {
          const res = decodeResponseProto(data);
          LogUtils.log("[PVE] battleEndPush:", res);
          if (!res.success) {
            PveBattleServiceNet.handleServerError(res);
            return;
          }
          const payload: PveBattleEnd =
            typeof res.data === "string" ? JSON.parse(res.data) : (res.data as any);
          PveBattleState.applyBattleEnd(payload);
          PveBattleEventBus.emit(PveBattleEventName.BattleEnd, payload);
        } catch (e) {
          LogUtils.error("[PVE] battleEndPush 解析失败:", e);
        }
      }
    );
  }

  /** 服务端错误统一处理（打印日志，可按需扩展 toast） */
  private static handleServerError(res: { msg?: string }): void {
    LogUtils.warn("[PVE] 服务端返回错误:", res?.msg);
  }

  /** 解析房间状态响应并缓存 + 派发事件 */
  private static handleRoomResponse(data: Uint8Array, tag: string): void {
    try {
      const res = decodeResponseProto(data);
      LogUtils.log(`[PVE] ${tag}:`, res);
      if (!res.success) {
        PveBattleServiceNet.handleServerError(res);
        return;
      }
      const payload = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (payload && payload.roomId != null && PveBattleState.roomId !== payload.roomId) {
        PveBattleState.reset(payload.roomId);
      }
      PveBattleState.roomSnapshot = payload;
      PveBattleEventBus.emit(PveBattleEventName.RoomUpdate, payload);
    } catch (e) {
      LogUtils.error(`[PVE] ${tag} 解析失败:`, e);
    }
  }

  // ==================== 请求方法 ====================

  public static createPveBattle(): void {
    PveBattleServiceNet.registerHandlers();
    this.query(CmdDataModel.PveBattleCmd, PveBattleCmd.CreatePveBattle, "创建 PVE 战斗房间");
  }

  public static joinPveBattle(): void {
    PveBattleServiceNet.registerHandlers();
    this.query(CmdDataModel.PveBattleCmd, PveBattleCmd.JoinPveBattle, "加入 PVE 房间");
  }

  public static nextRound(): void {
    PveBattleServiceNet.registerHandlers();
    this.query(CmdDataModel.PveBattleCmd, PveBattleCmd.NextRound, "下一回合");
  }

  public static settlePveBattle(): void {
    PveBattleServiceNet.registerHandlers();
    this.query(CmdDataModel.PveBattleCmd, PveBattleCmd.SettlePveBattle, "结算 PVE 战斗");
  }

  public static queryPveBattleRoom(): void {
    PveBattleServiceNet.registerHandlers();
    this.query(CmdDataModel.PveBattleCmd, PveBattleCmd.QueryPveBattleRoom, "查询 PVE 房间状态");
  }

  public static quickFinishPveBattle(): void {
    PveBattleServiceNet.registerHandlers();
    this.query(CmdDataModel.PveBattleCmd, PveBattleCmd.QuickFinishPveBattle, "快速跳过 PVE 战斗");
  }
}
