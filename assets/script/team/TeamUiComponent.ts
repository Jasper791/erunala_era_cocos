import { _decorator, Component, director, find, Node } from 'cc';
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('TeamUiComponent')
export class TeamUiComponent extends Component {

    // 回主界面
    public async goHome() {
        await util.scene.go("Home")
    }

}


