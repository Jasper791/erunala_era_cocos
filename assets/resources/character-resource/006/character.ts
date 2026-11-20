import { CampEnum } from "../../../common/game/UnitCampEnum";
import { CharacterMateState } from "../../../common/game/character/CharacterMateState";
import type { FightMapComponent } from "../../../script/fight/FightComponent";
import type { CharacterComponent } from "../../prefab-resource/CharacterComponent";
import {CharacterState, OtherState} from "../../../common/game/character/CharacterState";
import {util} from "../../../common/util/Util";
import {RegisterCharacter} from "../../../common/game/character/CharacterEnum";
import {math} from "cc";

@RegisterCharacter({id: "006"})
export class Character extends CharacterMateState {

    name: string = "女仆"

    camp: CampEnum = CampEnum.ORDINARY

    hpGrowth: number = 20

    energy: number = 90

    defenceGrowth: number = 8

    attackGrowth: number = 10

    pierceGrowth: number = 5

    speedGrowth: number = 10

    curePercent: number = 1.2

    career: "assassin" | "knight" | "mage" | "priest" | "ranger" = "priest"

    rare: "legend" | "epic" | "uncommon" | "excellent" | "ordinary" = "excellent"

    animationDirection: "left" | "right" = "right"

    // 动画类型
    animationType: "DragonBones" | "Spine" = "Spine"
    // 动画缩放
    animationScale: number = 2.6

    addition_1_introduce: string = `拍你一扫帚\n
    攻击回复20%攻击力的生命值
    攻击有20%概率沉默敌人 1回合
    `

    skillIntroduce: string = `精力充沛\n
    为3个生命值最低的友军回复攻击力90%的生命值
    并且提升治疗效率 10% 持续3回合
    `

    getAttackSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const enemy = enemyQueue[0]
            if (self.state.star >= 2 && Math.random() < 0.2)
                await enemy.beSilent(self , 1)
            // 造成100%攻击力的伤害 并且敌方获得10能量
            await enemy.beHurt(self , self.state.attack , {energy: 10})
            await self.beCure(self , self.state.attack * 0.2)
        }
    }

    // 技能行为逻辑
    getSkillBehavior(): (self: CharacterComponent , fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            // 播放音乐
            self.playSkillMusic()
            // 播放攻击动画
            await self.playCharacterAnimation("skill" , 1)
        }
    }

    // 技能结算函数 用于在动画播放完成后进行属性结算
    getSkillSettleAccount(): (self: CharacterComponent , fightMap: FightMapComponent) => Promise<any> {
        return async function(self: CharacterComponent , fightMap: FightMapComponent){
            let friendQueue = [...self.getFriendQueue(fightMap.allLiveCharacterQueue)]
            friendQueue = friendQueue.sort((a , b) => a.state.hp - b.state.hp)
            if (friendQueue.length > 3) friendQueue.length = 3
            for (const friend of friendQueue) {
                await friend.beCure(self , self.state.attack * 0.9 , {curePercent: 0.1})
                fightMap.listenRoundEvent(2 , () => friend.extra({curePercent: -0.1}))
            }
            return
        }
    }

}