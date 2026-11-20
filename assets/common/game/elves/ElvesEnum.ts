export interface Option {
    id: string
}

// TODO(资源编号临时方案): 枚举键 "001"-"003" 直接对应 resources/elves-resource/001-003
// 目录编号，目前是临时归类、语义不合理；后期优化方向：以服务端扫链(NFT)决定的精灵类型
// 命名目录并同步调整此处枚举键（详见 ElvesServiceNet/Config 中的同款 TODO）
export const ElvesEnum: any = {  }

export const RegisterElves: ((option: Option) => ClassDecorator) = (option) => {
    return (target: any) => {
        ElvesEnum[option.id] = target.getElvesMateData(option.id)
    }
}