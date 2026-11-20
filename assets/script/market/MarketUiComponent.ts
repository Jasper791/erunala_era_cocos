import { _decorator, Component, director, find, Node, Prefab } from 'cc';
import { LoadSceneComponent } from "../../resources/prefab-resource/LoadSceneComponent";
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('MarketUiComponent')
export class MarketUiComponent extends Component {

    @property({ type: Node, tooltip: 'scrollView' })
    public scrollView: Node = null

    @property({ type: Prefab, tooltip: '商品item' })
    public marketItem: Prefab = null

    @property({ type: Node, tooltip: '列表容器' })
    public content: Node = null

    @property({type:Node, tooltip:'详情'})
    public detail:Node = null


    // 开始渲染
    protected async start() {
        const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent)
        if (loadScenesComponent) loadScenesComponent.node.active = true
        loadScenesComponent?.setProgress(70)
        await this.renderList()
        loadScenesComponent?.setProgress(100)
        await loadScenesComponent?.awaitProgressEnd()
        if (loadScenesComponent) loadScenesComponent.node.active = false
        // this.renderList()
    }

    async renderList() {
        const prefab = await util.resource.loadResource(
            "prefab-resource/marketItem/MarketItem",
            Prefab
        )
        this.content?.children.forEach(c => c.destroy())
        this.content?.removeAllChildren()
    

        for (var i = 0; i <= 5; i++) {
            const node = await util.resource.createNodeByPrefab(prefab)
            this.content?.addChild(node)
            // 打开详情
            node.on('click', () => {
                console.log('show detail')
                this.detail.active = true
             

            })
        }
    }

    // 关闭详情
    public closeDetail() {
        console.log('closeDetail')
        this.detail.active = false
    }

    // 回主界面
    public async goHome() {
        await util.scene.go("Home")
    }

}


