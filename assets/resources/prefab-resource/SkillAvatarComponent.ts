import {_decorator, Component, find, Label, Node, Sprite, SpriteFrame} from 'cc';
import {EquipmentCreateData} from "../../common/game/equipment/EquipmentCreateData";
import {CharacterCreateData} from "../../common/game/character/CharacterCreateData";
import {getConfig, stockConfig} from "../../common/Config";
import {EquipmentEnum} from "../../common/game/equipment/EquipmentEnum";
import {util} from "../../common/util/Util";
import {SkillState} from "../../common/game/skill/SkillState";
import {SkillCreateData} from "../../common/game/skill/SkillCreateData";
const { ccclass, property } = _decorator;

@ccclass('SkillAvatarComponent')
export class SkillAvatarComponent extends Component {
    private $skill: SkillCreateData
    public get skill() { return this.$skill }

    // 设置技能
    async setSkill(skill: SkillCreateData) {
        this.$skill = skill
        // 设置图片
        const spriteFrame = await util.resource.loadResource(
            "skill-resource/" + skill.id + "/icon/spriteFrame" ,
            SpriteFrame
        )
        this.node.getChildByName("Sprite").getComponent(Sprite)
            .spriteFrame = spriteFrame
        // 设置等级
        this.node.getChildByName("Number").getComponent(Label).string = "Lv: " + skill.number
    }
}


