import { _decorator, Component,director, find,Node } from 'cc';
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('UiTopComponent')
export class UiTopComponent extends Component {

    // NewYear Benefit Recharge Activity
    public async goOpenserverForm() {
        await util.scene.go("Openserver")
    }

    public async goMarketForm() {
        await util.scene.go("Market")
    }

    //打开质押挖矿页面
    public async goMiningForm() {
        await util.scene.go("Mining")
    }

    public async goLoginserverForm() {
        await util.scene.go("Loginserver")
    }

    //打开设置页面
    public async goSettingForm() {
        await util.scene.go("Setting")
    }

}


