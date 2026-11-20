import { CampEnum } from "../../../common/game/UnitCampEnum";
import { CharacterMateState } from "../../../common/game/character/CharacterMateState";
import type { FightMapComponent } from "../../../script/fight/FightComponent";
import type { CharacterComponent } from "../../prefab-resource/CharacterComponent";
import {CharacterState, OtherState} from "../../../common/game/character/CharacterState";
import {util} from "../../../common/util/Util";
import {RegisterCharacter} from "../../../common/game/character/CharacterEnum";

@RegisterCharacter({id: "001"})
export class Character extends CharacterMateState {

    id: string = "001"

    name: string = "屠夫"

    camp: CampEnum = CampEnum.ORDINARY

    hpGrowth: number = 55

    energy: number = 100

    defenceGrowth: number = 15

    attackGrowth: number = 10

    pierceGrowth: number = 5

    speedGrowth: number = 10

    career: "assassin" | "knight" | "mage" | "priest" | "ranger" = "knight"

    rare: "legend" | "epic" | "uncommon" | "excellent" | "ordinary" = "epic"

    animationDirection: "left" | "right" = "right"

    // 动画类型
    animationType: "DragonBones" | "Spine" = "Spine"
    // 动画缩放
    animationScale: number = 2.0

    addition_1_introduce: string = `剧毒滋养\n
    额外获得 15% 护甲
    额外获得 20% 最大生命值
    `

    addition_2_introduce: string = `腐烂触摸\n
    每次攻击后有30%概率会使对方中毒持续两回合
    `

    skillIntroduce: string = `强心针\n
    自身回复50%已损失生命值 
    提升 20% 护甲
    提升 10% 攻击力 
    每回合开始回复 8% 最大生命值
    持续两回合
    `

    onCreatedState(state: CharacterState): CharacterState {
        if (state.star >= 2) {
            state.maxHp += state.maxHp * 0.2
            state.defence += state.defence * 0.15
        }
        return state
    }

    getAttackSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            // 中毒
            if (self.state.star >= 4 && Math.random() < 0.3)
                await enemy.bePoison(self , 2)
            // 造成100%攻击力的伤害 并且敌方获得10能量
            await enemy.beHurt(self , self.state.attack , {energy: 10})
        }
    }

    getSkillBehavior(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent, fightMap: FightMapComponent) {
            // 播放音乐
            self.playSkillMusic()
            // 播放攻击动画
            await self.playCharacterAnimation("skill" , 1)
        }
    }

    getSkillSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self: CharacterComponent, fightMap: FightMapComponent) => {
            const additionAttack = self.state.attack * 0.1
            const additionDefence = self.state.defence * 0.2
            await self.beCure(self , (self.state.maxHp - self.state.hp) * 0.3 , {
                attack: additionAttack ,
                defence: additionDefence
            })
            // 绑定回血
            for (let i = 1; i <= 2; i++)
                fightMap.listenRoundEvent(i , () => {
                    if (!fightMap.allLiveCharacterQueue.has(self)) return
                    self.beCure(self , self.state.maxHp * 0.08)
                })
            // 消除强化
            fightMap.listenRoundEvent(2 , () => self.extra({
                attack: -additionAttack ,
                defence: -additionDefence
            }))
            return
        }
    }

}