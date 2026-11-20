export interface Option {
    id: string
}

// 所有equipment<武器>的id 和源数据集合
export const ItemEnum = {
}

// 注册注解
export const RegisterItem: ((option: Option) => ClassDecorator) = (option) => {
    return (target: any) => {
        // 注册进来
        ItemEnum[option.id] = target.getEquipmentMateState(option.id)
    }
}
