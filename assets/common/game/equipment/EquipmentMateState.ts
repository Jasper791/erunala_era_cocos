import type {BaseUnitComponent} from "../../../resources/prefab-resource/BaseUnitComponent";
import {UnitMateStateBasic} from "../UnitMateStateBasic";
import {Resource} from "../../Config";
import {EquipmentCreateData} from "./EquipmentCreateData";
import {EquipmentEnum} from "./EquipmentEnum";

export class EquipmentMateState extends UnitMateStateBasic<BaseUnitComponent>{
    // 创建当前角色元数据对象
    static getEquipmentMateState(id: string): EquipmentMateState {
        const r = new this()
        r.id = id
        return r
    }
    // id
    id: string
    // 名字
    name: string = "Undefind"
    // 格挡率加成 1 - 100
    block: number = 0
    // 生命成长
    hp_growth: number  = 0
    // 防御成长
    defence_growth: number = 0
    // 攻击成长
    attack_growth: number = 0
    // 穿透成长
    pierce_growth: number = 0
    // 速度成长
    speed_growth: number = 0
    // 描述
    description: string = ""
    // 类型
    type: "helmet"|"weapon"|"decorate"|"shoe"
    // 售卖和升级的价格
    worth: Resource = new Resource()
}

export function getWorthResource (e: EquipmentCreateData): Resource {
    const worth = EquipmentEnum[e.id].worth
    return {
        gold: worth.gold * 5 * e.lv  * 0.7 * (e.lv / (e.lv + 10) + 0.7) ,
        diamond: worth.diamond * 1 * e.lv * 0.6 * (e.lv / (e.lv + 10 + 0.7)) ,
        soul: 0
    }
}
