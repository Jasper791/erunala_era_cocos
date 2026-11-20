import { _decorator, Component, director, Node, Prefab } from 'cc';
import { LoadSceneComponent } from '../../resources/prefab-resource/LoadSceneComponent';
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('PreloadComponent')
export class PreloadComponent extends Component {
    
    @property(Node)
    loadSceneNode: Node

    // 预加载所有资源
    async start() {
        // 加载界面
        const loadSceneNodeComponent = this.loadSceneNode.getComponent(LoadSceneComponent)

        // Home 场景预载与 prefab 加载并行发起（preloadScene 只预载不切换，无依赖）
        const preloadHome = new Promise<void>(res =>
            director.preloadScene("Home" , (err) => {
                if (err) {
                    console.error("[Preload] Home scene preload failed:", err)
                }
                loadSceneNodeComponent.setProgress(100)
                res()
            })
        )

        // 5 个通用 prefab 并行加载，每完成一个推进一格进度；失败时记录具体资源，不再静默当作成功
        const prefabNames = ["Character" , "CharacterAvatar" , "ConfirmData" , "LoadData" , "ShowData"]
        let done = 0
        const preloadResults = await Promise.all(prefabNames.map(name =>
            util.resource.loadResource(
                `prefab-resource/${name}` ,
                Prefab ,
                (err) => console.error(`[Preload] prefab load failed: prefab-resource/${name}`, err)
            ).then((resource) => {
                done++
                loadSceneNodeComponent.setProgress(20 + done * 10)
                return { name, resource }
            })
        ))

        const failedPrefabs = preloadResults.filter(result => !result.resource)
        if (failedPrefabs.length > 0) {
            console.error(
                "[Preload] stop before Home because prefab preload failed:",
                failedPrefabs.map(result => result.name).join(", ")
            )
            return
        }

        await preloadHome
        await loadSceneNodeComponent.awaitProgressEnd()

        director.loadScene("Home")
    }
}


