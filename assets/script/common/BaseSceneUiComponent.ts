import { _decorator, Component, director, find } from 'cc';
import { LoadSceneComponent } from '../../resources/prefab-resource/LoadSceneComponent';
import { util } from '../../common/util/Util';

// 空壳场景基类：进度条加载 + 返回主界面
export class BaseSceneUiComponent extends Component {
    // 开始渲染
    protected async start() {
        // 场景未内嵌 LoadScene 节点时容错（进度条流程可选）
        const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent);
        if (loadScenesComponent) loadScenesComponent.node.active = true;
        loadScenesComponent?.setProgress(70);
        await this.rerender();
        loadScenesComponent?.setProgress(100);
        await loadScenesComponent?.awaitProgressEnd();
        if (loadScenesComponent) loadScenesComponent.node.active = false;
    }

    // 子类可覆盖的渲染钩子
    protected async rerender() {}

    // 回主界面
    public async goHome() {
        await util.scene.go("Home");
    }
}
