import {EditBox , _decorator, Component, find, Label, Node, Prefab} from 'cc';
import {util} from "../../common/util/Util";
import {getConfig, stockConfig} from "../../common/Config";
import {EquipmentAvatarComponent} from "../../resources/prefab-resource/EquipmentAvatarComponent";
import {EquipmentMateState, getWorthResource} from "../../common/game/equipment/EquipmentMateState";
import {EquipmentEnum} from "../../common/game/equipment/EquipmentEnum";
import {EquipmentState} from "../../common/game/equipment/EquipmentState";
import {ItemAvatarComponent} from "../../resources/prefab-resource/ItemAvatarComponent";
import {ItemMateState} from "../../common/game/item/ItemMateState";
import {ItemEnum} from "../../common/game/item/ItemEnum";
import {ItemState} from "../../common/game/item/ItemState";
import {ItemCreateData} from "../../common/game/item/ItemCreateData";
import PropServiceNet from "../../serviceNet/PropServiceNet";
const { ccclass, property } = _decorator;

@ccclass('BackpackBackpackComponent')
export class BackpackBackpackComponent extends Component {
    @property(Node)
    ContentNode: Node
    @property(Node)
    NumberEditNode: Node

    protected async onLoad() {
        // 进场景补拉一次背包道具（登录时已预取，此处兜底）
        PropServiceNet.queryPropAll()
        await this.rerender()
    }

    // 当前选择
    private $currentItem: ItemAvatarComponent

    // 当前数量
    private $currentNumber: number = 0
    public set currentNumber(n: number) {
        if (n <= 0) n = 1
        this.$currentNumber = n
        this.NumberEditNode.getComponent(EditBox)
            .string = n + ""
    }
    public get currentNumber() {
        return parseInt(this.NumberEditNode.getComponent(EditBox).string) || 0
    }

    // 渲染背包
    public async rerender() {
        const close = await util.message.loadData()
        const config = getConfig()
        const prefab = await util.resource.loadResource(
            "prefab-resource/ItemAvatar" ,
            Prefab
        )
        this.ContentNode.children.forEach(c => {c.destroy()})
        this.ContentNode.removeAllChildren()
        const introduceNode = this.node.getChildByName("Introduce")
        let i = 0
        for (const item of config.userData.backpack) {
            const node = await util.resource.createNodeByPrefab(prefab)
            await node.getComponent(ItemAvatarComponent).setItem(item)
            this.ContentNode.addChild(node)
            const mateState: ItemMateState = ItemEnum[item.id]
            const state = ItemState.createState(mateState , item.number)
            // 打开简介
            node.on("click" , () => {
                this.$currentItem = node.getComponent(ItemAvatarComponent)
                // 设置信息
                introduceNode.active = true
                introduceNode.getChildByName("Name").getComponent(Label).string
                    = state.mateData.name
                introduceNode.getChildByName("Detail").getComponent(Label).string
                    = state.mateData.description
                // 对于无法使用的道具,它的使用和数字应该移除
                if (!state.mateData.canUse) {
                    introduceNode.getChildByName("Use").active = false
                    introduceNode.getChildByName("Number").active = false
                } else {
                    introduceNode.getChildByName("Use").active = true
                    introduceNode.getChildByName("Number").active = true
                }
            })
        }
        return close()
    }

    // 关闭简介
    public closeIntroduce() {
        this.currentNumber = 1
        this.node.getChildByName("Introduce").active = false
    }

    // 增加减少函数
    public addNumber() { this.currentNumber++ }
    public reduceNumber() { this.currentNumber-- }

    // 使用函数
    public async useItem() {
        const config = getConfig()
        this.node.getChildByName("Introduce").active = false
        const number = this.currentNumber
        for (let i = 0; i < config.userData.backpack.length; i++) {
            if (config.userData.backpack[i].id !== this.$currentItem.item.id)
                continue
            if (number > this.$currentItem.item.number) {
                await util.message.confirmData(find("Canvas") , {
                    message: "剩余数量不足"
                })
                break
            }
            if (!(await util.message.confirmData(find("Canvas") , {
                message: "确定要使用 "
                    + number + " 个 "
                    + ItemEnum[config.userData.backpack[i].id].name
                    + " 吗？"
            }))) return
            config.userData.backpack[i].number -= number
            const state =
                ItemState.createState(ItemEnum[config.userData.backpack[i].id] , number)
            for (let j = 0; j < number; j++) await state.onUse()
            break
        }
        config.userData.backpack = config.userData.backpack.filter(it => it.number)
        stockConfig()
        await this.rerender()
    }

}


