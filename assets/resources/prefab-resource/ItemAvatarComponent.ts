import {_decorator, Component, find, Label, Node, Sprite, SpriteFrame} from 'cc';
import {EquipmentCreateData} from "../../common/game/equipment/EquipmentCreateData";
import {CharacterCreateData} from "../../common/game/character/CharacterCreateData";
import {EquipmentEnum} from "../../common/game/equipment/EquipmentEnum";
import {ItemState} from "../../common/game/item/ItemState";
import {ItemCreateData} from "../../common/game/item/ItemCreateData";
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('ItemAvatarComponent')
export class ItemAvatarComponent extends Component {
    private $item: ItemCreateData
    public get item() { return this.$item }

    // 设置装备
    async setItem(item: ItemCreateData) {
        this.$item = item
        // 设置图片
        const spriteFrame = await util.resource.loadResource(
            "item-resource/" + item.id + "/icon/spriteFrame" ,
            SpriteFrame
        )
        this.node.getChildByName("Sprite").getComponent(Sprite)
            .spriteFrame = spriteFrame
        // 设置等级
        this.node.getChildByName("Number").getComponent(Label).string = "数量: " + item.number
    }
}


