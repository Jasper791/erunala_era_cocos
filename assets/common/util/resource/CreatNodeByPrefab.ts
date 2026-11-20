import { Node, Prefab, error } from "cc";

export async function createNodeByPrefab(prefab: Prefab): Promise<Node> {
    return new Promise(res => {
        prefab.createNode((err , node) => {
            if (err) return error(err)
            res(node)
        })
    })
}