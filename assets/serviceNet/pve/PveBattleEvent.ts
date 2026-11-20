import { EventTarget } from "cc";

/**
 * PVE 战斗全局事件与状态管理
 *
 * 服务端通过 WebSocket 主动推送（cmd=12）：
 *   subCmd=200 roundResultPush  每回合攻击结果（聚合该回合所有攻击事件）
 *   subCmd=201 battleEndPush    战斗结束（含奖励结算）
 *
 * 本模块提供：
 *   1. 全局事件总线 PveBattleEventBus（Cocos EventTarget）
 *   2. 战斗实时状态缓存 PveBattleState（供 UI 读取）
 *
 * UI 用法：
 *   PveBattleEventBus.on(PveBattleEventName.RoundResult, cb)
 *   PveBattleEventBus.on(PveBattleEventName.BattleEnd, cb)
 *   组件销毁时记得 PveBattleEventBus.off(...) 或 targetOff
 */

/** 事件名 */
export enum PveBattleEventName {
  /** 每回合攻击结果 */
  RoundResult = "pve-round-result",
  /** 战斗结束 */
  BattleEnd = "pve-battle-end",
  /** 房间状态更新（创建/加入/查询房间返回） */
  RoomUpdate = "pve-room-update",
}

/** 单次攻击事件（对应服务端 roundResultPush 中 events 数组元素） */
export interface PveAttackEvent {
  roomId: number;
  round: number;
  attackerFighterId: number;
  attackerName: string;
  defenderFighterId: number;
  defenderName: string;
  damage: number;
  dodged: boolean;
  crit: boolean;
  blocked: boolean;
  cohere: number;
  attackerNewHp: number;
  defenderNewHp: number;
  isDead: boolean;
  winner: number;
  actionType: number;
}

/** 回合结果推送（roundResultPush） */
export interface PveRoundResult {
  roomId: number;
  round: number;
  winner: number; // 0=未结束, 1=玩家胜, 2=BOSS胜
  events: PveAttackEvent[];
}

/** 战斗结束推送（battleEndPush） */
export interface PveBattleEnd {
  roomId: number;
  round: number;
  winner: number; // 1=玩家胜, 2=BOSS胜
  rewards: { gold?: number; exp?: number; [k: string]: any };
  settleTime: number;
}

/** 战斗实时状态（供 UI 读取展示） */
class PveBattleStateHolder {
  /** 当前房间 ID */
  roomId: number = 0;
  /** 当前回合数 */
  round: number = 0;
  /** 是否已结束 */
  settled: boolean = false;
  /** 胜者 0=未结束, 1=玩家胜, 2=BOSS胜 */
  winner: number = 0;
  /** 最新一回合结果 */
  lastRoundResult: PveRoundResult | null = null;
  /** 战斗结束数据 */
  battleEnd: PveBattleEnd | null = null;
  /** 房间最新快照（来自创建/加入/查询房间响应的原始 JSON） */
  roomSnapshot: any = null;

  /** 重置状态（新战斗开始时调用） */
  reset(roomId: number): void {
    this.roomId = roomId;
    this.round = 0;
    this.settled = false;
    this.winner = 0;
    this.lastRoundResult = null;
    this.battleEnd = null;
    this.roomSnapshot = null;
  }

  applyRoundResult(data: PveRoundResult): void {
    this.roomId = data.roomId;
    this.round = data.round;
    this.winner = data.winner;
    this.lastRoundResult = data;
  }

  applyBattleEnd(data: PveBattleEnd): void {
    this.roomId = data.roomId;
    this.round = data.round;
    this.winner = data.winner;
    this.settled = true;
    this.battleEnd = data;
  }
}

/** 战斗状态单例 */
export const PveBattleState = new PveBattleStateHolder();

/** 全局事件总线 */
export const PveBattleEventBus = new EventTarget();
