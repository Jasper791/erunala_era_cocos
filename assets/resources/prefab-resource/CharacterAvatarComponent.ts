import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { CharacterEnum } from '../../common/game/character/CharacterEnum';
import { util } from '../../common/util/Util';
import { EquipmentEnum } from '../../common/game/equipment/EquipmentEnum';
import { CharacterCreateData } from '../../common/game/character/CharacterCreateData';
const { ccclass, property } = _decorator;

@ccclass('CharacterAvatarNodeComponent')
export class CharacterAvatarComponent extends Component {

    public character: CharacterCreateData

    // 设置角色头像信息
    public async setCharacter(characterData:CharacterCreateData) {
        this.character = characterData
        // 等级
        this.node.getChildByName("Lv").getComponent(Label).string = characterData.lv ? "Lv:" + characterData.lv : ""
        // 加载头像资源
        const avatarSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "character-resource/" + characterData.id + "/avatar/spriteFrame" ,
                SpriteFrame ,
            )
       
        // 加载边框资源
        
        const boderSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "ui-resource/border/" + CharacterEnum[characterData.id].rare + "-border/spriteFrame" ,
                SpriteFrame
            )
        

        // 加载职业
        const careerSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "ui-resource/career/" + CharacterEnum[characterData.id].career + "/spriteFrame" ,
                SpriteFrame
            )
        // 加载阵营
        const campSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "ui-resource/camp/" + CharacterEnum[characterData.id].camp.split(" ")[1] + "/spriteFrame",
                SpriteFrame
            )
        // 分别添加
        this.node.getChildByName("Camp").getComponent(Sprite).spriteFrame = campSpriteFrame
        this.node.getChildByName("Avatar").getComponent(Sprite).spriteFrame = avatarSpriteFrame
        this.node.getChildByName("Border").getComponent(Sprite).spriteFrame = boderSpriteFrame
        this.node.getChildByName("Career").getComponent(Sprite).spriteFrame = careerSpriteFrame
        // 特效
        if (CharacterEnum[this.character.id].rare === "legend") {
            this.node.getChildByName("LegendCard").active = true
            this.node.getChildByName("LegendCardBackEffect").active = true
        }
    }

}


