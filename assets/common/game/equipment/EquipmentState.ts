import type { BaseUnitComponent } from "../../../resources/prefab-resource/BaseUnitComponent";
import { EquipmentMateState } from "./EquipmentMateState"
import { UnitStateBasic } from "../UnitStateBasic"

export class EquipmentState extends UnitStateBasic<BaseUnitComponent> {
    // id
    id: string = "000"
    // 名字
    name: string = "Undefind"
    // 等级
    lv: number = 1
    // 格挡率 1 - 100
    block: number = 5
    // 当前生命加成
    hp: number = 50
    // 当前防御加成
    defence: number = 10
    // 当前攻击加成
    attack: number = 20
    // 当前穿透加成
    pierce: number = 10
    // 当前速度加成
    speed: number = 15
    // 类型
    type: "helmet"|"weapon"|"decorate"|"shoe"

    mateData: EquipmentMateState

    // 根据 等级 元数据 装备 额外属性 创建装备状态
    static createState(lv: number , mateData: EquipmentMateState): EquipmentState {
        let newState = new EquipmentState()
        newState.name = mateData.name
        newState.lv = lv

        newState.block = mateData.block
        newState.attack = mateData.attack_growth * lv * (lv / (lv + 10) + 0.8)
        newState.defence = mateData.defence_growth * lv * (lv / (lv + 10) + 0.8)
        newState.speed = mateData.speed_growth * lv * (lv / (lv + 10) + 0.8)
        newState.pierce = mateData.pierce_growth * lv * (lv / (lv + 10) + 0.8)
        newState.type = mateData.type
        newState.mateData = mateData

        newState.initByMateState(mateData)

        newState = mateData.onCreatedState(newState)

        return newState
    }

    // 添加加成到单位（角色/精灵通用）
    public addProperty(state: { attack: number , block: number , defence: number , speed: number , pierce: number }) {
        state.attack += this.attack
        state.block += this.block
        state.defence += this.defence
        state.speed += this.speed
        state.pierce += this.pierce
    }

}
