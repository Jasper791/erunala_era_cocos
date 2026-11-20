// 单位阵营（角色/精灵通用）
export enum CampEnum {
    ORDINARY = "普通 ORDINARY" ,
    SACRED = "神圣 SACRED" ,
    ABYSS = "深渊 ABYSS" ,
    MACHINE = "机械 MACHINE" ,
    NATURE = "自然 NATURE" ,
    DARK = "暗夜 DARK"
}

// 克制表：[受击方阵营][攻击方阵营] => 伤害倍率（普通与同系固定 1.0，无需入表）
const CAMP_HURT_RATE: { [defender: string]: { [attacker: string]: number } } = {
    // 神圣
    [CampEnum.SACRED]: {
        [CampEnum.ABYSS]: 1.2 ,
        [CampEnum.MACHINE]: 1.2 ,
        [CampEnum.NATURE]: 0.8 ,
        [CampEnum.DARK]: 0.8 ,
    } ,
    // 深渊
    [CampEnum.ABYSS]: {
        [CampEnum.SACRED]: 0.8 ,
        [CampEnum.MACHINE]: 1.2 ,
        [CampEnum.NATURE]: 0.8 ,
        [CampEnum.DARK]: 1.2 ,
    } ,
    // 机械
    [CampEnum.MACHINE]: {
        [CampEnum.SACRED]: 0.8 ,
        [CampEnum.ABYSS]: 0.8 ,
        [CampEnum.NATURE]: 1.2 ,
        [CampEnum.DARK]: 1.2 ,
    } ,
    // 自然
    [CampEnum.NATURE]: {
        [CampEnum.SACRED]: 1.2 ,
        [CampEnum.ABYSS]: 1.2 ,
        [CampEnum.MACHINE]: 0.8 ,
        [CampEnum.DARK]: 0.8 ,
    } ,
    // 暗夜
    [CampEnum.DARK]: {
        [CampEnum.SACRED]: 1.2 ,
        [CampEnum.ABYSS]: 0.8 ,
        [CampEnum.MACHINE]: 0.8 ,
        [CampEnum.NATURE]: 1.2 ,
    } ,
}

// 克制关系（结构化参数，角色/精灵通用）
export function getCampHurtRate(self: { state: { camp: CampEnum } } , enemy: { state: { camp: CampEnum } }): number {
    // 普通和同系对所有为 1.0
    if (
        self.state.camp === CampEnum.ORDINARY
        ||
        enemy.state.camp === CampEnum.ORDINARY
        ||
        enemy.state.camp === self.state.camp
    ) return 1.0
    return (CAMP_HURT_RATE[enemy.state.camp] || {})[self.state.camp] || 1.0
}
