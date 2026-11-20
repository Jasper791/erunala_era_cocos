import { CampEnum } from "../../../common/game/UnitCampEnum";
import { CharacterMateState } from "../../../common/game/character/CharacterMateState";
import type { FightMapComponent } from "../../../script/fight/FightComponent";
import type { CharacterComponent } from "../../prefab-resource/CharacterComponent";
import {CharacterState, OtherState} from "../../../common/game/character/CharacterState";
import {util} from "../../../common/util/Util";
import {RegisterCharacter} from "../../../common/game/character/CharacterEnum";

@RegisterCharacter({id: "002"})
export class Character002 extends CharacterMateState {

    id: string = "002"

    name: string = "孙悟空"

    camp: CampEnum = CampEnum.SACRED

    hpGrowth: number = 40

    energy: number = 80

    defenceGrowth: number = 13

    attackGrowth: number = 20

    pierceGrowth: number = 10

    speedGrowth: number = 13

    career: "assassin" | "knight" | "mage" | "priest" | "ranger" = "ranger"

    rare: "legend" | "epic" | "uncommon" | "excellent" | "ordinary" = "legend"

    animationDirection: "left" | "right" = "right"

    // 动画类型
    animationType: "DragonBones" | "Spine" = "Spine"
    // 动画缩放
    animationScale: number = 2.0

    addition_1_introduce: string = `火眼金睛\n
    获得20%额外攻击力\n20%额外护甲穿透\n20%速度
    `

    addition_2_introduce: string = `法天相地\n
    每次攻击后有15%概率会再次获得一次攻击机会
    `

    skillIntroduce: string = `定海神针\n
    对一排敌人造成 140% 攻击力的伤害，并造成2回合的眩晕
    `


    onCreatedState(state: CharacterState): CharacterState {
        if (state.star >= 2) {
            state.attack += state.attack * 0.2
            state.pierce += state.pierce * 0.2
            state.speed += state.speed * 0.2
        }
        return state
    }

    getAfterAction(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self , fightMap) => {
            // 15%概率再次出手
            if (self.state.star >= 4 && Math.random() < 0.15) {
                await self.beginAction()
            }
            return
        }
    }

    getSkillSettleAccount(): (self: CharacterComponent, fightMap: FightMapComponent) => Promise<any> {
        return async (self: CharacterComponent, fightMap: FightMapComponent) => {
            // 默认获取一个敌人最外侧的敌人
            let enemyQueue = [...self.getEnemyQueue(fightMap.allLiveCharacterQueue)]
            enemyQueue = enemyQueue.sort((a , b) => a.coordinate.clo - b.coordinate.clo)
            const targetEnemy = enemyQueue.filter(e => e.coordinate.row === enemyQueue[0].coordinate.row)
            // 造成伤害
            const promises: Promise<any>[] = []
            for (let i = 0; i < targetEnemy.length; i++) {
                promises.push(targetEnemy[i].beHurt(self, self.state.attack * 1.4))
                await targetEnemy[i].beDizziness(self , 2 , fightMap)
            }
            return Promise.all(promises)
        }
    }

}