import { CampEnum } from "../../../common/game/UnitCampEnum";
import { CharacterMateState } from "../../../common/game/character/CharacterMateState";
import type { FightMapComponent } from "../../../script/fight/FightComponent";
import type { CharacterComponent } from "../../prefab-resource/CharacterComponent";
import {CharacterState, OtherState} from "../../../common/game/character/CharacterState";
import {util} from "../../../common/util/Util";
import {RegisterCharacter} from "../../../common/game/character/CharacterEnum";
import {math} from "cc";


@RegisterCharacter({id: "005"})
export class Character extends CharacterMateState {

    name: string = "依棠"

    camp: CampEnum = CampEnum.SACRED

    hpGrowth: number = 30

    energy: number = 100

    defenceGrowth: number = 13

    attackGrowth: number = 20

    pierceGrowth: number = 10

    speedGrowth: number = 10

    career: "assassin" | "knight" | "mage" | "priest" | "ranger" = "ranger"

    rare: "legend" | "epic" | "uncommon" | "excellent" | "ordinary" = "legend"

    animationDirection: "left" | "right" = "right"

    // 动画类型
    animationType: "DragonBones" | "Spine" = "Spine"
    // 动画缩放
    animationScale: number = 2.2

    addition_1_introduce: string = `不灭之火\n
    攻击力增加15%
    防御力增加15%
    攻击会回复造成伤害的15%的生命值
    `

    addition_2_introduce: string = `涅槃\n
    死亡后有90% 40% 20% 5%概率重生 回复50%生命值
    移除所有负面状态
    获得10%攻击力10%防御力加成 持续两回合
    `

    skillIntroduce: string = `神火眷顾\n
    为所有友军回复 30% 攻击力的生命值
    为所有友军增加依棠攻击力20%的防御
    为所有友军增加依棠攻击力20%的攻击力
    持续两回合
    `

    onCreatedState(state: CharacterState): CharacterState {
        if (state.star >= 2) {
            state.attack += state.attack * 0.15
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
            // 造成100%攻击力的伤害 并且敌方获得10能量 回复10%生命值
            const injury = await enemy.beHurt(self , self.state.attack , {energy: 10})
            if (self.state.star >= 2) await self.beCure(self , injury * 0.1)
        }
    }

    getSkillBehavior(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            // 播放音乐
            self.playSkillMusic()
            // 播放攻击动画
            await self.playCharacterAnimation("skill" , 1)
        }
    }

    getSkillSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            [...self.getFriendQueue(fightMap.allLiveCharacterQueue)]
                .forEach(c => {
                    let additionAttack = self.state.attack * 0.20
                    let additionDefence = self.state.defence * 0.20
                    c.extra({
                        attack: additionAttack ,
                        defence: additionDefence
                    })
                    c.beCure(self , self.state.attack * 0.3)
                    fightMap.listenRoundEvent(2 , () =>
                        self.extra({attack: -additionAttack , defence: -additionDefence})
                    )
                })
            return
        }
    }


    getOnDead(): (self: CharacterComponent, target: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        let relifeNumber = 0
        let rate = [0.9 , 0.4 , 0.2 , 0.05]
        return async (self: CharacterComponent, target: CharacterComponent, fightMap: FightMapComponent) => {
            if (self.state.star < 4 || Math.random() > rate[relifeNumber] ) return
            await self.relife(self , self.state.maxHp * 0.5)
            let additionAttack = self.state.attack * 0.1
            let additionDefence = self.state.defence * 0.1
            self.extra({attack: additionAttack , defence: additionDefence})
            fightMap.listenRoundEvent(2 , () =>
                self.extra({attack: -additionAttack , defence: -additionDefence})
            )
            self.state.otherState = new OtherState()
            self.updateUi()
            relifeNumber++
            if (relifeNumber >= rate.length) relifeNumber = rate.length - 1
            return
        }
    }

}