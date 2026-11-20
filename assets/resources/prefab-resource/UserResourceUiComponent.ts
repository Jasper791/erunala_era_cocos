import { _decorator, Component, Node , Label} from 'cc';
import {getConfig} from "../../common/Config";
import {util} from "../../common/util/Util";
const { ccclass, property } = _decorator;

@ccclass('UserResourceUiComponent')
export class UserResourceUiComponent extends Component {
    protected start() {
        this.updateUI()
    }

    public updateUI(
        gold: number = getConfig().userData.gold,
        diamond: number = getConfig().userData.diamond,
        soul: number = getConfig().userData.soul
    ) {
        // 金币
        this.node
            .getChildByName("GoldUi")
            .getChildByName("Number")
            .getComponent(Label).string = util.normalData(gold)
        // 钻石
        this.node
            .getChildByName("DiamondUi")
            .getChildByName("Number")
            .getComponent(Label).string = util.normalData(diamond)
        // 灵魂
        this.node
            .getChildByName("SoulStoneUi")
            .getChildByName("Number")
            .getComponent(Label).string = util.normalData(soul)
    }

}


