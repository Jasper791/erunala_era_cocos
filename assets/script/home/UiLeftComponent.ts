import { _decorator, Component,director, find,Node } from 'cc';
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('UiLeftComponent')
export class UiLeftComponent extends Component {

    //打开邮件场景
    public async goEmailForm() {
        await util.scene.go("Email")
    }

    //打开好友场景
    public async goFriendForm() {
        await util.scene.go("Friend")
    }

    // 打开任务场景
    public async goTaskForm() {
        await util.scene.go("Task")
    }

    //打开排行场景
    public async goRankingForm() {
        await util.scene.go("Ranking")
    }

}


