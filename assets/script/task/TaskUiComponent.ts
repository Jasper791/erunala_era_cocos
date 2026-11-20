import { _decorator, Component, director, find, Node, Prefab } from 'cc';
import {LoadSceneComponent} from "../../resources/prefab-resource/LoadSceneComponent";
import { util } from '../../common/util/Util';
import ChainBizServiceNet from '../../serviceNet/ChainBizServiceNet';
import { TaskItem } from '../../resources/prefab-resource/taskItem/TaskItem';
const { ccclass, property } = _decorator;

@ccclass('TaskUiComponent')
export class TaskUiComponent extends Component {

    @property({ type: Node, tooltip: 'scrollView' })
       public scrollView: Node = null
   
   
       @property({ type: Node, tooltip: '列表容器' })
       public content: Node = null

    // 开始渲染
    protected async start() {
        const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent)
        if (loadScenesComponent) loadScenesComponent.node.active = true
        loadScenesComponent?.setProgress(70)
      
        //await this.rerender()
        loadScenesComponent?.setProgress(100)
        await loadScenesComponent?.awaitProgressEnd()
        if (loadScenesComponent) loadScenesComponent.node.active = false
        await this.renderList()
    }

    async renderList() {
        const prefab = await util.resource.loadResource(
            // 资源 bundle 索引里目录是小写 taskItem（大小写敏感），勿改回大写
            "prefab-resource/taskItem/TaskItem",
            Prefab
        )
        this.content?.children.forEach(c => c.destroy())
        this.content?.removeAllChildren()

        // 上链中间状态列表：queryChainBiz → 服务端读 Redis 队列返回 ChainBiz 数组
        const list = await ChainBizServiceNet.queryChainBizAsync()
        for (const record of list) {
            const node = await util.resource.createNodeByPrefab(prefab)
            this.content?.addChild(node)
            node.getComponent(TaskItem)?.init(record)
        }
    }
    
    // 回主界面
    public async goHome() {
        await util.scene.go("Home")
    }

}


