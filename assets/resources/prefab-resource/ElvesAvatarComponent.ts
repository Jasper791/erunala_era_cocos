import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { ElvesEnum } from '../../common/game/elves/ElvesEnum';
import { util } from '../../common/util/Util';
import { ElvesCreateData } from '../../common/game/elves/ElvesCreateData';
const { ccclass, property } = _decorator;

@ccclass('ElvesAvatarNodeComponent')
export class ElvesAvatarComponent extends Component {

    public elves: ElvesCreateData

    // 设置角色头像信息
    public async setCharacter(elvesData:ElvesCreateData) {
        this.elves = elvesData
        // 等级
        this.node.getChildByName("Lv").getComponent(Label).string = elvesData.lv ? "Lv:" + elvesData.lv : ""
        // 加载头像资源
        const avatarSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "elves-resource/" + elvesData.id + "/avatar/spriteFrame" ,
                SpriteFrame ,
            )
       
        // 加载边框资源
        
        const boderSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "ui-resource/border/" + ElvesEnum[elvesData.id].rare + "-border/spriteFrame" ,
                SpriteFrame
            )
        

        // 加载职业
        const careerSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "ui-resource/career/" + ElvesEnum[elvesData.id].career + "/spriteFrame" ,
                SpriteFrame
            )
        // 加载阵营
        const campSpriteFrame =
            await util.resource.loadResource<SpriteFrame>(
                "ui-resource/camp/" + ElvesEnum[elvesData.id].camp.split(" ")[1] + "/spriteFrame",
                SpriteFrame
            )
        // 分别添加
        this.node.getChildByName("Camp").getComponent(Sprite).spriteFrame = campSpriteFrame
        this.node.getChildByName("Avatar").getComponent(Sprite).spriteFrame = avatarSpriteFrame
        this.node.getChildByName("Border").getComponent(Sprite).spriteFrame = boderSpriteFrame
        this.node.getChildByName("Career").getComponent(Sprite).spriteFrame = careerSpriteFrame
        // 特效
        if (ElvesEnum[this.elves.id].rare === "legend") {
            this.node.getChildByName("LegendCard").active = true
            this.node.getChildByName("LegendCardBackEffect").active = true
        }
    }

}


