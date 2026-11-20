import { CampEnum } from "../../../common/game/UnitCampEnum";
import { CharacterMateState } from "../../../common/game/character/CharacterMateState";
import type { FightMapComponent } from "../../../script/fight/FightComponent";
import type { CharacterComponent } from "../../prefab-resource/CharacterComponent";
import {CharacterState, OtherState} from "../../../common/game/character/CharacterState";
import {util} from "../../../common/util/Util";
import {RegisterCharacter} from "../../../common/game/character/CharacterEnum";

@RegisterCharacter({id: "003"})
export class Character extends CharacterMateState {

    id: string = "003"

    name: string = "重楼"

    camp: CampEnum = CampEnum.ABYSS

    hpGrowth: number = 30

    energy: number = 100

    defenceGrowth: number = 13

    attackGrowth: number = 20

    pierceGrowth: number = 10

    speedGrowth: number = 15

    career: "assassin" | "knight" | "mage" | "priest" | "ranger" = "mage"

    rare: "legend" | "epic" | "uncommon" | "excellent" | "ordinary" = "epic"

    animationDirection: "left" | "right" = "right"

    // 动画类型
    animationType: "DragonBones" | "Spine" = "DragonBones"
    // 动画缩放
    animationScale: number = 1.0

    addition_1_introduce: string = `魔君之体\n
    额外获得20%的穿透
    额外获得10%的攻击力
    `

    addition_2_introduce: string = `地狱之火\n
    造成伤害有30%概率烧伤敌人 持续两回合
    `

    skillIntroduce: string = `魔君降世\n
    对所有敌人造成130%攻击力的伤害
    降低敌人15%护甲2回合
    `

    onCreatedState(state: CharacterState): CharacterState {
        if (state.star >= 2) {
            state.attack += state.attack * 0.1
            state.pierce += state.pierce * 0.2
        }
        return state
    }

    getAttackSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self: CharacterComponent, fightMap: FightMapComponent) => {
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            // 30%概率烧伤
            if (self.state.star >= 4 && Math.random() < 0.3) await enemy.beBurn(self , 2)
            // 造成100%攻击力的伤害 并且敌方获得10能量
            await enemy.beHurt(self , self.state.attack , {energy: 10})
        }
    }

    getSkillBehavior(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self: CharacterComponent, fightMap: FightMapComponent) => {
            // 播放音乐
            self.playSkillMusic()
            // 播放攻击动画
            await self.playCharacterAnimation("skill" , 1)
        }
    }

    getSkillSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self: CharacterComponent, fightMap: FightMapComponent) => {
            // 全体造成伤害
            const enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            const promises: Promise<any>[] = []
            for (let i = 0; i < enemyQueue.length; i++) {
                const enemy = enemyQueue[i]
                const reducingDefence = enemy.state.defence * 0.15
                // 30%概率烧伤敌人
                if (self.state.star >= 4 && Math.random() < 0.3) await enemy.beBurn(self , 2)
                // 攻击力降低
                promises.push(enemy.beHurt(self , self.state.attack * 1.3 , {
                    defence: -reducingDefence
                }))
                await fightMap.listenRoundEvent(2 , () => enemy.extra({
                    defence: reducingDefence
                }))
            }
            return Promise.all(promises)
        }
    }
}