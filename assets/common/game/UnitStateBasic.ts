import type { UnitBehavior, UnitCheckBehavior, UnitDeBuffBehavior, UnitTargetBehavior } from "./fight-types";
import type { UnitMateStateBasic } from "./UnitMateStateBasic";

// 单位状态基类：持有全部行为函数，T 为挂载该状态的组件类型
export class UnitStateBasic<T> {

    public initByMateState(mateData: UnitMateStateBasic<T>) {
        this.afterAction = mateData.getAfterAction()
        this.onFightBegin = mateData.getOnFightBegin()
        this.onRoundBegin = mateData.getOnRoundBegin()
        this.onRoundEnd = mateData.getOnRoundEnd()
        this.onSleep = mateData.getOnSleep()
        this.onDizziness = mateData.getOnDizziness()
        this.onBeHurt = mateData.getOnBeHurt()
        this.onBeCure = mateData.getOnBeCure()
        this.onDeBuff = mateData.getOnDeBuff()
        this.onDead = mateData.getOnDead()
    }

    // 行动完成函数
    afterAction: UnitBehavior<T>

    // 周期函数 战斗开始时调用
    onFightBegin: UnitBehavior<T>

    // 周期函数 回合开始时调用
    onRoundBegin: UnitBehavior<T>

    // 周期函数 回合结束时调用
    onRoundEnd: UnitBehavior<T>

    // 周期函数 异常状态时调用 返回值决定状态是否生效
    onDeBuff: UnitDeBuffBehavior<T>

    // 周期函数 被休眠时使用 返回值决定状态是否生效
    onSleep: UnitCheckBehavior<T>

    // 周期函数 被眩晕时使用 返回值决定状态是否生效
    onDizziness: UnitCheckBehavior<T>

    // 周期函数 受伤时调用
    onBeHurt: UnitTargetBehavior<T>

    // 周期函数 受到治疗时调用
    onBeCure: UnitTargetBehavior<T>

    // 周期函数 死亡时调用
    onDead: UnitTargetBehavior<T>

}
