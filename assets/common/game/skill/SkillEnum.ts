export interface Option {
    id: string
}

// 所有equipment<武器>的id 和源数据集合
export const SkillEnum = {
}

// 注册注解
export const RegisterSkill: ((option: Option) => ClassDecorator) = (option) => {
    return (target: any) => {
        // 注册进来
        SkillEnum[option.id] = target.getSkillMateState(option.id)
    }
}
