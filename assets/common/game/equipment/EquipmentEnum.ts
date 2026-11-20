export interface Option {
    id: string
}

// 所有equipment<武器>的id 和源数据集合
export const EquipmentEnum: any = {
}

// 注册注解
export const RegisterEquipment: ((option: Option) => ClassDecorator) = (option) => {
    return (target: any) => {
        // 注册进来
        EquipmentEnum[option.id] = target.getEquipmentMateState(option.id)
    }
}