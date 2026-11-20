import {find , Prefab , _decorator, Component, Node , Label} from 'cc';
import {getConfig, stockConfig} from "../../common/Config";
import {util} from "../../common/util/Util";
import {EquipmentAvatarComponent} from "../../resources/prefab-resource/EquipmentAvatarComponent";
import {EquipmentState} from "../../common/game/equipment/EquipmentState";
import {EquipmentEnum} from "../../common/game/equipment/EquipmentEnum";
import {EquipmentMateState, getWorthResource} from "../../common/game/equipment/EquipmentMateState";
const { ccclass, property } = _decorator;

@ccclass('BackpackEquipmentComponent')
export class BackpackEquipmentComponent extends Component {
    @property(Node)
    ContentNode: Node

    private $currentEquipment: EquipmentAvatarComponent

    // 渲染装备
    public async rerender() {
        const close = await util.message.loadData()
        const config = getConfig()
        const prefab = await util.resource.loadResource(
            "prefab-resource/EquipmentAvatar" ,
            Prefab
        )
        this.ContentNode.children.forEach(c => {c.destroy()})
        this.ContentNode.removeAllChildren()
        const introduceNode = this.node.getChildByName("Introduce")
        for (const equipment of config.userData.equipments) {
            const node = await util.resource.createNodeByPrefab(prefab)
            await node.getComponent(EquipmentAvatarComponent).setEquipment(equipment)
            this.ContentNode.addChild(node)
            const mateState: EquipmentMateState = EquipmentEnum[equipment.id]
            const state = EquipmentState.createState(equipment.lv , mateState)
            // 打开简介
            node.on("click" , () => {
                this.$currentEquipment = node.getComponent(EquipmentAvatarComponent)
                // 设置信息
                introduceNode.active = true

                introduceNode.getChildByName("Name")
                    .getComponent(Label).string = state.name
                    
                const LvSprite = introduceNode.getChildByName("LvSprite")
                LvSprite.getChildByName("Lv")
                    .getComponent(Label).string = ""+ Math.ceil(state.lv)

                introduceNode.getChildByName("Attack")
                    .getComponent(Label).string = "攻击力: " + Math.ceil(state.attack)
                introduceNode.getChildByName("Defence")
                    .getComponent(Label).string = "防御力: " + Math.ceil(state.defence)
                introduceNode.getChildByName("Pierce")
                    .getComponent(Label).string = "穿透值: " + Math.ceil(state.pierce)
                introduceNode.getChildByName("Speed")
                    .getComponent(Label).string = "速度值: " + Math.ceil(state.speed)
                introduceNode.getChildByName("Block")
                    .getComponent(Label).string = "格挡值: " + Math.ceil(state.block)
                introduceNode.getChildByName("Introduce")
                    .getComponent(Label).string = mateState.description
                // 设置价格
                const resource = getWorthResource(this.$currentEquipment.equipment)
                introduceNode.getChildByName("SlateResource").getChildByName("Gold")
                    .getChildByName("Number").getComponent(Label)
                    .string = util.normalData(resource.gold)
                introduceNode.getChildByName("SlateResource").getChildByName("Diamond")
                    .getChildByName("Number").getComponent(Label)
                    .string = util.normalData(resource.diamond)
            })
        }
        return close()
    }

    // 关闭简介
    public closeIntroduce() {
        this.node.getChildByName("Introduce").active = false
    }

    // 卖出函数
    public async saleEquipment() {
        const config = getConfig()
        const resource = getWorthResource(this.$currentEquipment.equipment)
        const result = await util.message.confirmData(find("Canvas") , {
            message: "确定要卖掉 " + EquipmentEnum[this.$currentEquipment.equipment.id].name + " 吗？"
        })
        if (!result) return
        config.userData.gold += resource.gold
        config.userData.diamond += resource.diamond
        for (let i = 0; i < config.userData.equipments.length; i++) {
            if (this.$currentEquipment.equipment.uuid === config.userData.equipments[i].uuid) {
                config.userData.equipments.splice(i, 1)
                break
            }
        }
        stockConfig()
        this.node.getChildByName("Introduce").active = false
        await this.rerender()
    }
}


