import { Prefab, error, resources , Node } from "cc"
import { ConfirmDataComponent } from "../../../resources/prefab-resource/ConfirmDataComponent"

export interface Option {
    message?: string
    r?: number
    g?: number
    b?: number

    scaleX?: number
    scaleY?: number

    title?: string

    fontSize?: number

    toggleMessage?: string
    toggleChangeEvent?: (c: boolean) => any
}

export async function confirmData(parent: Node , content: Option): Promise<boolean> {
    return new Promise((res) => {
        resources.load("prefab-resource/ConfirmData" , Prefab , (err , prefab) => {
            if (err) return error(err)
            prefab.createNode((err , node) => {
                if (err) return error(err)
                const confirmDataComponent = node.getComponent(ConfirmDataComponent)
                confirmDataComponent.setContent(content)
                confirmDataComponent.sureQueue.push(() => res(true))
                confirmDataComponent.cancelQueue.push(() => res(false))
                parent.addChild(node)
            })
        })
    })
}
