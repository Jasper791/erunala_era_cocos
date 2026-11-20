import type { UnitBehavior, UnitCheckBehavior, UnitDeBuffBehavior, UnitTargetBehavior } from "./fight-types";
import type { UnitStateBasic } from "./UnitStateBasic";

// 单位元数据基类：提供全部行为函数的默认空实现，T 为挂载组件类型
export class UnitMateStateBasic<T> {

    // 被创建时调用
    onCreatedState<S extends UnitStateBasic<any>>(state: S): S { return state }

    // 行动完成后
    getAfterAction(): UnitBehavior<T> {
        return async function() {}
    }

    // 周期函数 战斗开始时调用
    getOnFightBegin(): UnitBehavior<T> {
        return async function() {}
    }

    // 周期函数 回合开始时调用
    getOnRoundBegin(): UnitBehavior<T> {
        return async function() {}
    }

    // 周期函数 回合结束时调用
    getOnRoundEnd(): UnitBehavior<T> {
        return async function() {}
    }

    // 周期函数，受到异常状态时调用 返回值决定异常状态是否生效
    getOnDeBuff(): UnitDeBuffBehavior<T> {
        return async () => true
    }

    // 周期函数 被休眠时使用 返回值决定异常状态是否生效
    getOnSleep(): UnitCheckBehavior<T> {
        return async function() { return true }
    }

    // 周期函数 被眩晕时使用 返回值决定异常状态是否生效
    getOnDizziness(): UnitCheckBehavior<T> {
        return async function() { return true }
    }

    // 周期函数 受伤时调用
    getOnBeHurt(): UnitTargetBehavior<T> {
        return async function() {}
    }

    // 周期函数 受到治疗时调用
    getOnBeCure(): UnitTargetBehavior<T> {
        return async function() {}
    }

    // 周期函数 死亡时调用
    getOnDead(): UnitTargetBehavior<T> {
        return async function() {}
    }

}
