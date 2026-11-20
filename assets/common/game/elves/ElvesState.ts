import type { ElvesComponent } from "../../../resources/prefab-resource/ElvesComponent";
import { EquipmentEnum } from "../equipment/EquipmentEnum";
import { createUnitState, OtherState, UnitState } from "../UnitState";
import { ElvesMateState } from "./ElvesMateState";

export { OtherState }

export class ElvesState extends UnitState<ElvesComponent> {

    // 根据 等级 元数据 装备 额外属性 创建精灵状态
    static createState(
        lv: number ,
        mateData: ElvesMateState ,
        equipments: {id: keyof (typeof EquipmentEnum) , lv: number}[] ,
        extra: Partial<ElvesState> ,
        star: number = 1,
        createOrdinary: boolean = true): ElvesState {
        return createUnitState(ElvesState , lv , mateData , equipments , extra , star , createOrdinary)
    }

}
