import { Node, NodeEventType, Prefab, error, find, resources } from "cc"
import { LoadDataComponent } from "../../../resources/prefab-resource/LoadDataComponent"

let prefab: Prefab = null

export async function loadData(parent: Node = find("Canvas"), content?: string) {
    if (!prefab) {
        prefab = await new Promise<Prefab>(res => {
            resources.load("prefab-resource/LoadData" , Prefab , (err , prefab) => {
                // 失败必须 resolve，否则 await 方永久挂起（表现为界面卡在加载中）
                if (err) { error(err); res(null); return }
                res(prefab)
            })
        })
    }
    if (!prefab) return () => {}
    const node = await new Promise<Node>(res => {
        prefab.createNode((err , node) => {
            if ( err ) { error(err); res(null); return }
            res(node)
        })
    })
    if (!node) return () => {}
    node.getComponent(LoadDataComponent).setContent(content)
    if (node.isValid && parent) parent.addChild(node)
    return function() {
        if(node.parent)
            node.parent.removeChild(node)
        if (node.isValid) node.destroy()
    }
}
