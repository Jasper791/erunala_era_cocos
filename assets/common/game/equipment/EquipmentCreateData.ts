// 创建角色的信息
export interface EquipmentCreateData {
    // character<角色>的id
    id: string

    // character<角色>的等级
    lv: number

    // uuid唯一实体id
    uuid?: number
    // 名称
    name?:string
}