import {SkillMateState} from "./SkillMateState";

export class SkillState {

    id: string

    number: number

    mateData: SkillMateState

    // 根据 等级 元数据 装备 额外属性 创建角色状态
    static createState(mateData: SkillMateState , number: number): SkillState {
        const newState = new this()
        newState.id = mateData.id
        newState.number = number
        newState.mateData = mateData

        newState.onUse = mateData.getOnUse()
        return newState
    }

    onUse: () => any;
}
