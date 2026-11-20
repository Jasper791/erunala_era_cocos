import {ItemMateState} from "./ItemMateState";

export class ItemState {

    id: string

    number: number

    mateData: ItemMateState

    // 根据 等级 元数据 装备 额外属性 创建角色状态
    static createState(mateData: ItemMateState , number: number): ItemState {
        const newState = new this()
        newState.id = mateData.id
        newState.number = number
        newState.mateData = mateData

        newState.onUse = mateData.getOnUse()
        return newState
    }

    onUse: () => any;
}
