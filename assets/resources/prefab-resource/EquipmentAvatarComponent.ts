import {find , _decorator, Component, Node , SpriteFrame , Sprite , Label} from 'cc';
import {EquipmentCreateData} from "../../common/game/equipment/EquipmentCreateData";
import {util} from "../../common/util/Util";
import {CharacterCreateData} from "../../common/game/character/CharacterCreateData";
import {getConfig, stockConfig} from "../../common/Config";
import {EquipmentMateState} from "../../common/game/equipment/EquipmentMateState";
import {EquipmentEnum} from "../../common/game/equipment/EquipmentEnum";
const { ccclass, property } = _decorator;

@ccclass('EquipmentAvatarComponent')
export class EquipmentAvatarComponent extends Component {
    private $equipment: EquipmentCreateData
    public get equipment() { return this.$equipment }

    // 装备该装备函数
    public async characterEquipment (c: CharacterCreateData) {
        const config = getConfig()
        for (let i = 0; i < config.userData.equipments.length; i++) {
            const e = config.userData.equipments[i]
            if (e.uuid !== this.$equipment.uuid) continue
            const filter = config.userData.equipments
                .filter(e => EquipmentEnum[e.id].type === EquipmentEnum[this.$equipment.id].type)
            if (filter.length > 0)
                return util.message.confirmData(find("Canvas") , {
                    message: "已经装备过同类型的装备了"
                })
            config.userData.equipments.splice(i , 1)
            c.equipments.push(this.$equipment)
            break
        }
        stockConfig()
        return
    }

    // 设置装备
    async setEquipment(e: EquipmentCreateData) {
        this.$equipment = e
        // 设置图片
        const spriteFrame = await util.resource.loadResource(
            "equipment-resource/" + e.id + "/icon/spriteFrame" ,
            SpriteFrame
        )
        this.node.getChildByName("Sprite").getComponent(Sprite)
            .spriteFrame = spriteFrame
        // 设置等级
        this.node.getChildByName("Lv").getComponent(Label).string =""+ e.lv

        const nameSprite =  this.node.getChildByName("NameSprite")
        nameSprite.getChildByName("Name").getComponent(Label).string = ""+ e.name
    }

}


