import { EquipmentEnum } from "./equipment/EquipmentEnum";
import { EquipmentState } from "./equipment/EquipmentState";
import { CampEnum } from "./UnitCampEnum";
import type { UnitBehavior } from "./fight-types";
import { UnitStateBasic } from "./UnitStateBasic";
import type { UnitMateState } from "./UnitMateState";
import type { BaseUnitComponent } from "../../resources/prefab-resource/BaseUnitComponent";

// 单位的其他异常状态
export class OtherState {
    // 中毒状态
    private $isPoison: number = 0
    get isPoison() { return this.$isPoison }
    set isPoison(v: number) { if (v < 0) v = 0;this.$isPoison = v }
    // 烧伤状态
    private $isBurn: number = 0
    get isBurn() { return this.$isBurn }
    set isBurn(v: number) { if (v < 0) v = 0;this.$isBurn = v }
    // 恐惧状态
    private $isFrighten: number = 0
    get isFrighten() { return this.$isFrighten }
    set isFrighten(v: number) { if (v < 0) v = 0;this.$isFrighten = v }
    // 休眠状态
    private $isSleep: number = 0
    get isSleep() { return this.$isSleep }
    set isSleep(v: number) { if (v < 0) v = 0;this.$isSleep = v }
    // 是否处于眩晕状态
    private $isDizziness: number = 0
    get isDizziness() { return this.$isDizziness }
    set isDizziness(v: number) { if (v < 0) v = 0;this.$isDizziness = v }
    // 是否被魅惑
    private $isCharm: number = 0
    get isCharm() { return this.$isCharm }
    set isCharm(v: number) { if (v < 0) v = 0;this.$isCharm = v }
    // 是否被沉默
    private $isSilent: number = 0
    get isSilent() { return this.$isSilent }
    set isSilent(v: number) { if (v < 0) v = 0;this.$isSilent = v }
}

// 单位状态（角色/精灵通用），T 为挂载该状态的组件类型
export class UnitState<T extends BaseUnitComponent = BaseUnitComponent> extends UnitStateBasic<T> {
    // id
    id: string = "000"
    // 名字
    name: string = "Undefined"
    // 星级
    star: number = 1
    // 等级
    lv: number = 1
    // 当前能量条
    energy: number = 20
    // 最大能量条
    maxEnergy: number = 20
    // 格挡率 1 - 100
    block: number = 5
    // 当前生命
    hp: number = 50
    // 最大生命
    maxHp: number = 50
    // 当前防御
    defence: number = 10
    // 当前攻击
    attack: number = 20
    // 当前穿透
    pierce: number = 10
    // 当前速度
    speed: number = 15
    // 治疗效率
    curePercent: number = 1
    // 其他异常状态
    otherState: OtherState = new OtherState
    // 装备槽
    equipments = {
        "helmet": null ,
        "weapon": null ,
        "decorate": null ,
        "shoe": null
    }
    // 单位阵营
    camp: CampEnum = CampEnum.ORDINARY
    // 原始状态 可以用于对比
    ordinaryCharacterState?: UnitState<T>
    // 对应的元数据
    mateData: UnitMateState<T>

    // 技能行为函数
    skillBehavior: UnitBehavior<T>

    // 技能结算函数
    skillSettleAccount: UnitBehavior<T>

    // 攻击行为函数
    attackBehavior: UnitBehavior<T>

    // 攻击结算函数
    attackSettleAccount: UnitBehavior<T>
}

// 根据 等级 元数据 装备 额外属性 创建单位状态
export function createUnitState<S extends UnitState<any>>(
    ctor: new () => S ,
    lv: number ,
    mateData: UnitMateState<any> ,
    equipments: {id: keyof (typeof EquipmentEnum) , lv: number}[] ,
    extra: Partial<S> ,
    star: number = 1 ,
    createOrdinary: boolean = true
): S {

    let newState = new ctor()
    newState.mateData = mateData
    newState.lv = lv
    newState.id = mateData.id
    newState.name = mateData.name
    newState.star = star

    // 星级加成公式
    newState.maxHp = mateData.hpGrowth * lv * (lv / 100 + 1) * (star / (star + 3) + 1) + (extra.maxHp || 0)
    newState.block = mateData.block + (extra.block || 0)
    newState.attack = mateData.attackGrowth + mateData.attackGrowth * lv * (lv / 100 + 0.7) * (star / (star + 3) + 1) + (extra.attack || 0)
    newState.defence = mateData.defenceGrowth + mateData.defenceGrowth * lv * (lv / 100 + 0.7) * (star / (star + 3) + 1) * 0.7 + (extra.defence || 0)
    newState.speed = mateData.speedGrowth + mateData.speedGrowth * lv * (lv / 100 + 0.7) * (star / (star + 3) + 1) * 0.6 + (extra.speed || 0)
    newState.pierce = mateData.pierceGrowth + mateData.pierceGrowth * lv * (lv / 100 + 0.7) * (star / (star + 3) + 1) + (extra.pierce || 0)
    newState.energy = 20 + (extra.energy || 0)
    newState.maxEnergy = mateData.energy + (extra.maxEnergy || 0)
    newState.curePercent = mateData.curePercent + (extra.curePercent || 0)
    newState.camp = extra.camp || mateData.camp

    equipments.forEach((e) => {
        const equipemnt = EquipmentState.createState(e.lv , EquipmentEnum[e.id])
        if (newState.equipments[equipemnt.type] !== null) return
        equipemnt.addProperty(newState)
        newState.equipments[equipemnt.type] = equipemnt
    })

    newState = mateData.onCreatedState(newState)

    if (createOrdinary) {
        newState.attackBehavior = mateData.getAttackBehavior()
        newState.attackSettleAccount = mateData.getAttackSettleAccount()
        newState.skillBehavior = mateData.getSkillBehavior()
        newState.skillSettleAccount = mateData.getSkillSettleAccount()

        newState.initByMateState(mateData)

        newState.ordinaryCharacterState = createUnitState(ctor , lv , mateData , equipments , extra , star , false)
    }

    if (newState.maxHp <= 0) newState.maxHp = 10
    if (newState.maxEnergy <= 0) newState.maxEnergy = 10
    newState.hp = newState.maxHp

    return newState
}
