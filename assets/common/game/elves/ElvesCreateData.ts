import { EquipmentCreateData } from "../equipment/EquipmentCreateData";
import type { ElvesState } from "./ElvesState";

// 创建精灵的信息
export interface ElvesCreateData {
    // character<角色>的id
    id: string

    // 服务端原始编号（TODO 临时字段：服务端扫链NFT决定类型并两端对齐前，id 是映射后的客户端资源编号，此字段保留服务端编号供写操作回传）
    serverId?: string

    // character<角色>的等级
    lv: number

    // uuid唯一实体id
    uuid?: number

    // 角色星级
    star?: number

    // 左侧还是右侧
    direction?: "left"|"right"

    // 纵坐标
    row?: number

    // 横坐标
    clo?: number

    // 是否是boss
    isBoss?: boolean

    // 装备们
    equipments?: EquipmentCreateData[]

    // character<角色>的额外属性
    extra?: Partial<ElvesState>
}