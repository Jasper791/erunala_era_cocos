import { _decorator, Component, director, find, Node } from 'cc';
import {LoadSceneComponent} from "../../resources/prefab-resource/LoadSceneComponent";
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('AttackUiComponent')
export class AttackUiComponent extends Component {

    // 开始渲染
    protected async start() {
        const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent)
        if (loadScenesComponent) loadScenesComponent.node.active = true
        loadScenesComponent?.setProgress(70)
        //await this.rerender()
        loadScenesComponent?.setProgress(100)
        await loadScenesComponent?.awaitProgressEnd()
        if (loadScenesComponent) loadScenesComponent.node.active = false
    }

    // 回主界面
    public async goHome() {
        await util.scene.go("Home")
    }

}


