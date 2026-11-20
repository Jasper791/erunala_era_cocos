import { _decorator, find } from 'cc';
import { util } from '../../common/util/Util';
import { BaseSceneUiComponent } from '../common/BaseSceneUiComponent';
const { ccclass } = _decorator;

@ccclass('BlindboxUiComponent')
export class BlindboxUiComponent extends BaseSceneUiComponent {
    // 开始渲染（空实现：不显示进度条，与基类不同故保留覆盖）
    protected async start() {
    }

    public async showPopWin(){
        if (!(await util.message.confirmData(find("Canvas") , {message: "确定打开此盲盒吗？"}))) return
    }

}
