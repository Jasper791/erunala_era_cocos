import { _decorator, Component, director, find, Label, Node } from 'cc';
import { CharacterComponent } from '../../resources/prefab-resource/CharacterComponent';
import { util } from '../../common/util/Util';
import { getConfig } from '../../common/Config';
import {CharacterEnum} from "../../common/game/character/CharacterEnum";
import {ElvesEnum} from "../../common/game/elves/ElvesEnum";
import { common } from '../../common/Common';
const { ccclass, property } = _decorator;

@ccclass('BattleMapComponent')
export class BattleMapComponent extends Component {

    @property(Node)
    timeShowNode: Node

    update(deltaTime: number) {
        const config = getConfig()
        if (this.node.scale.x < 1)
            this.node.setScale(
                this.node.scale.x + 0.1 ,
                this.node.scale.y + 0.1 ,
                this.node.scale.z ,
            )
        const gapTime = Date.now() - config.userData.challengeTime.goldMap
        if (gapTime >= 12 * 60 * 60 * 1000) {
            this.timeShowNode.getComponent(Label).string = ""
        } else {
            const nextTime = 12 * 60 * 60 * 1000 - gapTime
            const house = Math.floor(nextTime / 1000 / 60 / 60)
            const minutes = Math.floor(nextTime / 1000 / 60) % 60
            const second = Math.floor(nextTime / 1000) % 60
            this.timeShowNode.getComponent(Label).string =
                "距离下一次挑战有 "
                + (house < 10 ? "0" + house : house)  + ":"
                + (minutes < 10 ? "0" + minutes : minutes) + ":"
                + (second < 10 ? "0" + second : second)
        }
    }

    public closeGoldMap() {
        this.node.setScale( 0 , 0 , this.node.scale.z )
        this.node.active = false
    }

    // 开始战斗
    public async startFight() {
        const config = getConfig()
        // 时间是否到了
        // if (Date.now() - config.userData.challengeTime.goldMap < 12 * 60 * 60 * 1000) {
        //     util.message.confirmData(find("Canvas") , {message: "还没有到时间哦，等会再来吧"})
        //         .then()
        //     return
        // }
        // boss 等级
        const bossLv = 10
        // 确定
        if (!(await util.message.confirmData(find("Canvas") , {message: "每12小时只有一次挑战机会，确定要继续吗"}))) return
        // 定义奖励函数
        common.fightReward.getDiamond = (fightMap) => {
            const allLive = [...fightMap.allLiveCharacterQueue]
            // 获取Boss
            let boss: CharacterComponent = null
            for (let i = 0; i < allLive.length; i++) {
                const characterComponent = allLive[i]
                if (characterComponent.direction !== "right") continue
                boss = characterComponent
                break
            }
            const diamond = Math.random() * 5 * bossLv
            if (boss === null) return Math.floor(diamond)
            return Math.ceil(diamond * boss.state.hp / boss.state.maxHp)
        }
        common.fightReward.getExp = common.fightReward.getSoul = common.fightReward.getGold =
            (fightMap) => {
            const maxGold = 1000 * bossLv
            const allLive = [...fightMap.allLiveCharacterQueue]
            // 获取Boss
            let boss: CharacterComponent = null
            for (let i = 0; i < allLive.length; i++) {
                const characterComponent = allLive[i]
                if (characterComponent.direction !== "right") continue
                boss = characterComponent
                break
            }
            // 根据boss剩余血量进行结算
            let resultGold: number
            if (boss === null) resultGold = maxGold * 1.5
            else resultGold = Math.max(maxGold - maxGold * boss.state.hp / boss.state.maxHp , 200)
            // 暂时不记录时间
            config.userData.challengeTime.goldMap = Date.now()
            return resultGold
        }

        Math.min(config.userData.lv - (config.userData.lv % 10) + 30 , 100)
        // 敌方 3X3 阵型：英雄前排 3 个（中间为 boss），精灵中排 3 个，id 均从客户端资源枚举随机
        const heroKeys = Object.keys(CharacterEnum)
        const elvesKeys = Object.keys(ElvesEnum)
        const randOf = (keys: string[]) => keys[Math.floor(Math.random() * keys.length)] as any
        common.rightCharacterQueue = [1, 2, 3].map(clo => ({
            id: randOf(heroKeys) ,
            clo ,
            row: 1 ,
            lv: bossLv ,
            direction: "right" as const ,
            isBoss: clo === 2 ,
            star: 5 ,
            extra: {
                maxHp: 200 * bossLv / (bossLv + 20) * bossLv ,
                defence: 15 * bossLv / (bossLv + 20)  * bossLv ,
                attack: 15 * bossLv / (bossLv + 20)  * bossLv ,
                curePercent: -0.4
            } as any
        }))
        // 敌方精灵中排 3 个（比英雄略脆）
        common.rightElvesQueue = [1, 2, 3].map(clo => ({
            id: randOf(elvesKeys) ,
            clo ,
            row: 2 ,
            lv: bossLv ,
            direction: "right" as const ,
            star: 5 ,
            extra: {
                maxHp: 120 * bossLv / (bossLv + 20) * bossLv ,
                defence: 10 * bossLv / (bossLv + 20) * bossLv ,
                attack: 12 * bossLv / (bossLv + 20) * bossLv ,
            } as any
        }))
        // 设置我方英雄队列
        common.leftCharacterQueue = [...config.userData.characterQueue]
        // 设置我方精灵队列（3X3阵型中后排，最多6个）
        common.leftElvesQueue = [...config.userData.elvesQueue].slice(0, 6).map(e => ({ ...e, direction: "left" }))
        await util.scene.go("Fight")
        return
    }
}