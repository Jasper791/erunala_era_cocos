import { CampEnum } from "../../../common/game/UnitCampEnum";
import { CharacterMateState } from "../../../common/game/character/CharacterMateState";
import type { FightMapComponent } from "../../../script/fight/FightComponent";
import type { CharacterComponent } from "../../prefab-resource/CharacterComponent";
import {CharacterState, OtherState} from "../../../common/game/character/CharacterState";
import {util} from "../../../common/util/Util";
import {RegisterCharacter} from "../../../common/game/character/CharacterEnum";


@RegisterCharacter({id: "004"})
export class Character extends CharacterMateState {

    id: string = "004"

    name: string = "切尔西"

    camp: CampEnum = CampEnum.ABYSS

    hpGrowth: number = 25

    energy: number = 90

    defenceGrowth: number = 10

    attackGrowth: number = 23

    pierceGrowth: number = 12

    speedGrowth: number = 15

    career: "assassin" | "knight" | "mage" | "priest" | "ranger" = "assassin"

    rare: "legend" | "epic" | "uncommon" | "excellent" | "ordinary" = "epic"

    animationDirection: "left" | "right" = "right"

    // 动画类型
    animationType: "DragonBones" | "Spine" = "Spine"
    // 动画缩放
    animationScale: number = 2.4

    addition_1_introduce: string = `魔界之力\n
    速度增加20%
    攻击力增加20%
    穿甲增加15%
    `

    addition_2_introduce: string = `魅魔之吻\n
    回合开始有19%的概率随机魅惑角色持续3回合
    每一个魅惑角色都会使魅魔伤害提高25%
    魅魔女王免疫魅惑
    `

    skillIntroduce: string = `邪魅之风\n
    对同一排两个敌人造成攻击力110%攻击力的伤害
    `

    onCreatedState(state: CharacterState): CharacterState {
        if (state.star >= 2) {
            state.speed += state.speed * 0.2
            state.pierce += state.pierce * 0.15
            state.attack += state.attack * 0.15
        }
        return state
    }

    getOnDeBuff(): (self: CharacterComponent, buffName: keyof OtherState, fightMap: FightMapComponent) => Promise<boolean> {
        return async (self: CharacterComponent, buffName: keyof OtherState, fightMap: FightMapComponent) => {
            if (buffName === "isCharm" && self.state.star >= 4) return false
            return true
        }
    }

    getOnRoundBegin(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self: CharacterComponent, fightMap: FightMapComponent) => {
            const allCharacter = [...fightMap.allLiveCharacterQueue]
            for (let i = 0; i < 3; i++) {
                if (self.state.star >= 4 && Math.random() < 0.19) {
                    await allCharacter[Math.floor(allCharacter.length * Math.random())]
                        .beCharm(self , 3)
                }
            }
            return
        }
    }

    getAttackBehavior(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return super.getAttackBehavior();
    }

    getAttackSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            let hurtCent = 1
            // 伤害加成计算
            fightMap.allLiveCharacterQueue
                .forEach(e => e.state.otherState.isCharm > 0 ? hurtCent += 0.25 : 0)
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            // 造成100%攻击力的伤害 并且敌方获得10能量
            await enemy.beHurt(self , self.state.attack * hurtCent, {energy: 10})
        }
    }

    getSkillBehavior(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return super.getSkillBehavior();
    }

    getSkillSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            let hurtCent = 1
            // 伤害加成计算
            fightMap.allLiveCharacterQueue
                .forEach(e => e.state.otherState.isCharm > 0 ? hurtCent += 0.25 : 0)
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            let targetQueue: CharacterComponent[] = [enemyQueue[0]]
            // 获取两个同排的敌人
            for (let i = 1; i < enemyQueue.length; i++) {
                if (enemyQueue[i].coordinate.row === targetQueue[0].coordinate.row) {
                    targetQueue.push(enemyQueue[i])
                    break
                }
            }
            // 造成伤害 并且敌方获得10能量
            for (const target of targetQueue)
                await target.beHurt(self , self.state.attack * hurtCent * 1.1 , {energy: 10})
            return
        }
    }

}