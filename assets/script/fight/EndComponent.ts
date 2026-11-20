import { _decorator, AudioSource, Component, director, Node , Label} from 'cc';
import { getConfig, stockConfig } from '../../common/Config';
import {util} from "../../common/util/Util";
import { common, FightReward } from '../../common/Common';
import { FightMapComponent } from './FightComponent';
const { ccclass, property , boolean} = _decorator;

@ccclass('EndComponent')
export class EndComponent extends Component {
    @property(Node)
    fightMap: Node
    @property(Node)
    titleNode: Node

    protected onEnable(): void {
        const config = getConfig()
        // 缩放为0
        this.titleNode.setScale( 0 , 0 , this.titleNode.position.z )
        // 停止音乐
        this.fightMap.getComponent(AudioSource).stop()
        // 播放自己的音乐
        const audio = this.node.getComponent(AudioSource)
        audio.volume = config.volume * config.volumeDetail.fight
        audio.play()
        // 奖励结算
        const exp = common.fightReward.getExp(this.fightMap.getComponent(FightMapComponent))
        const gold = common.fightReward.getGold(this.fightMap.getComponent(FightMapComponent))
        const soul = common.fightReward.getSoul(this.fightMap.getComponent(FightMapComponent))
        const diamond = common.fightReward.getDiamond(this.fightMap.getComponent(FightMapComponent))
        const equipments = common.fightReward.getEquipments(this.fightMap.getComponent(FightMapComponent))
        // 动态添加
        this.addNodeAnimation(this.node.getChildByName("Gold") , gold)
        this.addNodeAnimation(this.node.getChildByName("Soul") , soul)
        this.addNodeAnimation(this.node.getChildByName("Diamond") , diamond)
        this.addNodeAnimation(this.node.getChildByName("Exp") , exp)
        // 添加
        config.userData.exp += exp
        config.userData.gold += gold
        config.userData.soul += soul
        config.userData.diamond += diamond
        config.userData.equipments.push(...equipments)
        // 清空奖励函数
        common.fightReward = new FightReward()
        // 清空数组
        common.rightCharacterQueue.length = 0
        // 保存数据
        stockConfig()
    }

    update(deltaTime: number) {
        if (this.titleNode.scale.x < 1){
            this.titleNode.setScale(
                this.titleNode.scale.x + 0.05,
                this.titleNode.scale.y + 0.05,
                this.titleNode.position.z
            )
        }
        const fialure = this.node.getChildByName("Failure")
        if (fialure && fialure.scale.x > 3) {
            fialure.setScale(
                fialure.scale.x - 0.4 ,
                fialure.scale.y - 0.4 ,
                fialure.scale.z
            )
        }
    }

    addNodeAnimation(node: Node , num: number) {
        const valueNode = node.getChildByName("Value")
        let i = 0
        let content = 0
        valueNode.getComponent(Label).string = "0"
        let inter = setInterval(() => {
            if (!valueNode.isValid || i >= 10) {
                clearInterval(inter)
                return
            }
            valueNode.getComponent(Label).string = util.normalData(content += (num / 10))
            i++
        } , 100)
    }

    goBackHome() {
        // 回城
        util.scene.go("Home")
    }

    goUpHeroLevel() {
        util.scene.go("Hero")
    }
}


