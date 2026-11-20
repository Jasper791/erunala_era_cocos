import type { CharacterComponent } from "../../../resources/prefab-resource/CharacterComponent";
import { EquipmentEnum } from "../equipment/EquipmentEnum";
import { createUnitState, OtherState, UnitState } from "../UnitState";
import { CharacterMateState } from "./CharacterMateState";

export { OtherState }

export class CharacterState extends UnitState<CharacterComponent> {

    // 根据 等级 元数据 装备 额外属性 创建角色状态
    static createState(
        lv: number ,
        mateData: CharacterMateState ,
        equipments: {id: keyof (typeof EquipmentEnum) , lv: number}[] ,
        extra: Partial<CharacterState> ,
        star: number = 1,
        createOrdinary: boolean = true): CharacterState {
        return createUnitState(CharacterState , lv , mateData , equipments , extra , star , createOrdinary)
    }

}
