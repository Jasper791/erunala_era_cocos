import { Prefab, error, resources , Node , NodePool} from "cc"
import { ShowDataComponent } from "../../../resources/prefab-resource/ShowDataComponent"
import { loadResource } from "../resource/LoadResource"

export interface Option {
    r?: number
    g?: number
    b?: number

    scaleX?: number
    scaleY?: number


    fontSize?: number

    speed?: number
}

// 上升的消息
export function showString(parent: Node , str: string , option: Option = {}) {
    loadResource("prefab-resource/ShowData" , Prefab).then(prefab => {
        prefab.createNode((err , node) => {
            if (err) return error(err)
            node.getComponent(ShowDataComponent).setLabelString(str , option)
            parent.addChild(node)
        })
    })
}
