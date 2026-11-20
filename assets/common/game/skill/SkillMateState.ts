export class SkillMateState {

    // 创建当前物品元数据对象
    static getSkillMateState(id: string): SkillMateState {
        const r = new this()
        r.id = id
        return r
    }

    // id
    id: string
    // 是否可以使用
    canUse: boolean = false
    // 名字
    name: string = "Undefind"
    // 描述
    description: string = ""

    number:0

    // 使用函数
    getOnUse(): () => any { return () => null }
}
