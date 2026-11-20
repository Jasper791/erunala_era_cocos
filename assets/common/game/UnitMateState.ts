import type { BaseUnitComponent } from "../../resources/prefab-resource/BaseUnitComponent";
import type { FightMapComponent } from "../../script/fight/FightComponent";
import { EquipmentState } from "./equipment/EquipmentState";
import { CampEnum } from "./UnitCampEnum";
import { UnitMateStateBasic } from "./UnitMateStateBasic";
import type { UnitBehavior, UnitCheckBehavior, UnitDeBuffBehavior, UnitTargetBehavior } from "./fight-types";
import type { UnitState } from "./UnitState";

// 稀有程度对应等级
const RARE_LEVEL = {
    legend: 5 ,
    epic: 4 ,
    uncommon: 3 ,
    excellent: 2 ,
    ordinary: 1 ,
}

export function getLevelFromRare(rare: "legend"|"epic"|"uncommon"|"excellent"|"ordinary") {
    return RARE_LEVEL[rare]
}

// 单位元数据（角色/精灵通用），T 为挂载组件类型
export class UnitMateState<T extends BaseUnitComponent = BaseUnitComponent> extends UnitMateStateBasic<T> {
    // id
    id: string
    // 名字
    name: string = "Undefind"
    // 能量条
    energy: number = 100
    // 格挡率 1 - 150
    block: number = 10
    // 生命成长
    hpGrowth: number  = 50
    // 防御成长
    defenceGrowth: number = 10
    // 攻击成长
    attackGrowth: number = 20
    // 穿透成长
    pierceGrowth: number = 0
    // 速度成长
    speedGrowth: number = 15
    // 治疗效率
    curePercent: number = 1
    // 稀有程度
    rare: "legend"|"epic"|"uncommon"|"excellent"|"ordinary" = "legend"
    // 职业
    career: "assassin"|"knight"|"mage"|"priest"|"ranger" = "ranger"
    // 单位阵营
    camp: CampEnum = CampEnum.ORDINARY

    // 动画缩放
    animationScale: number = 1.0
    // 动画类型
    animationType: "DragonBones" | "Spine" = "DragonBones"
    // 动画朝向
    animationDirection: "left"|"right"  = "left"

    // 四个技能简介
    attackIntroduce: string = "普通攻击\n\n获取最外侧的敌人，对其造成 100% 攻击力的伤害"
    skillIntroduce: string = "技能攻击\n\n获取最外侧的敌人，对其造成 130% 攻击力的伤害"
    addition_1_introduce: string = ""
    addition_2_introduce: string = ""

    // 创建状态后的加工钩子：此处用具体签名遮蔽泛型基类签名，便于资源子类用具体状态类型覆盖
    onCreatedState(state: any): any { return state }

    // 攻击行为逻辑
    getAttackBehavior(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent){
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(self.getOwnLiveQueue(fightMap))]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            if (!enemy) return
            // 移动到敌人位置
            const returnFunction =
                await self.moveCharacterToEnemyCoordinate(enemy.coordinate.row , enemy.coordinate.clo)
            // 播放音乐
            self.playAttackMusic()
            // 播放攻击动画（随机：资源里有 skill2/skill1/skill 时随机出现）
            await self.playRandomAttackAnimation()
            // 回到原位
            await returnFunction()
        }
    }

    // 攻击结算函数 用于在动画播放完成后进行属性结算
    getAttackSettleAccount(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent){
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(self.getOwnLiveQueue(fightMap))]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            // 造成100%攻击力的伤害 并且敌方获得10能量
            await enemy.beHurt(self , self.state.attack , {energy: 10})
        }
    }

    // 技能行为逻辑
    getSkillBehavior(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent){
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(self.getOwnLiveQueue(fightMap))]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            // 移动到敌人位置
            const returnFunction =
                await self.moveCharacterToEnemyCoordinate(enemy.coordinate.row , enemy.coordinate.clo)
            // 播放音乐
            self.playSkillMusic()
            // 播放攻击动画
            await self.playCharacterAnimation("skill" , 1)
            // 回到原位
            await returnFunction()
        }
    }

    // 技能结算函数 用于在动画播放完成后进行属性结算
    getSkillSettleAccount(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent){
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(self.getOwnLiveQueue(fightMap))]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            // 造成130%攻击力的伤害 并且敌方获得10能量
            await enemy.beHurt(self , self.state.attack * 1.3 , {energy: 10})
        }
    }

    // 行动完成后
    getAfterAction(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.afterAction(self , fightMap)
            }
            return
        }
    }

    // 周期函数 战斗开始时调用
    getOnFightBegin(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.onFightBegin(self , fightMap)
            }
            return
        }
    }

    // 周期函数 回合开始时调用
    getOnRoundBegin(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.onRoundBegin(self , fightMap)
            }
            return
        }
    }

    // 周期函数 回合结束时调用
    getOnRoundEnd(): UnitBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.onRoundEnd(self , fightMap)
            }
            return
        }
    }

    // 周期函数，受到异常状态时调用 返回值决定异常状态是否生效
    getOnDeBuff(): UnitDeBuffBehavior<T> {
        return async function(self: T , buffName: any , fightMap: FightMapComponent) {
            let result = true
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                let r = true
                if (equipment)
                    r = await equipment.onDeBuff(self , buffName , fightMap)
                if (result) result = r
            }
            return result
        }
    }

    // 周期函数 被休眠时使用 返回值决定异常状态是否生效
    getOnSleep(): UnitCheckBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent) {
            let result = true
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                let r = true
                if (equipment)
                    r = await equipment.onSleep(self , fightMap)
                if (result) result = r
            }
            return result
        }
    }

    // 周期函数 被眩晕时使用 返回值决定异常状态是否生效
    getOnDizziness(): UnitCheckBehavior<T> {
        return async function(self: T , fightMap: FightMapComponent) {
            let result = true
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                let r = true
                if (equipment)
                    r = await equipment.onDizziness(self , fightMap)
                if (result) result = r
            }
            return result
        }
    }

    // 周期函数 受伤时调用
    getOnBeHurt(): UnitTargetBehavior<T> {
        return async function(self: T , target: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.onBeHurt(self , target , fightMap)
            }
            return
        }
    }

    // 周期函数 受到治疗时调用
    getOnBeCure(): UnitTargetBehavior<T> {
        return async function(self: T , target: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.onBeCure(self , target , fightMap)
            }
            return
        }
    }

    // 周期函数 死亡时调用
    getOnDead(): UnitTargetBehavior<T> {
        return async function(self: T , target: T , fightMap: FightMapComponent) {
            // 装备生效
            const equipmentType = Object.keys(self.state.equipments)
            for (let i = 0; i < equipmentType.length; i++) {
                const equipment: EquipmentState = self.state.equipments[equipmentType[i]]
                if (equipment)
                    await equipment.onDead(self , target , fightMap)
            }
            return
        }
    }
}
