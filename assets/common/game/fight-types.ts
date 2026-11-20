import type { FightMapComponent } from "../../script/fight/FightComponent";
import type { OtherState } from "./UnitState";

// 战斗行为函数类型集中声明（仅类型依赖，切断 common/game 与组件层的循环依赖）

// 行为/结算/周期函数
export type UnitBehavior<T> = (self: T, fightMap: FightMapComponent) => Promise<any>;

// 异常状态判定函数 返回值决定状态是否生效
export type UnitDeBuffBehavior<T> = (self: T, buffName: keyof OtherState, fightMap: FightMapComponent) => Promise<boolean>;

// 休眠/眩晕判定函数 返回值决定状态是否生效
export type UnitCheckBehavior<T> = (self: T, fightMap: FightMapComponent) => Promise<boolean>;

// 带目标的行为函数（受伤/治疗/死亡）
export type UnitTargetBehavior<T> = (self: T, target: T, fightMap: FightMapComponent) => Promise<any>;
