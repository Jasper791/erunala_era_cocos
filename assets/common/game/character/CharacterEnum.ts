export interface Option {
    id: string
}

// TODO(资源编号临时方案): 枚举键 "001"-"006" 直接对应 resources/character-resource/001-006 与
// arms-resource/001-006 目录编号，目前是临时归类、语义不合理；后期优化方向：以服务端扫链(NFT)
// 决定的英雄类型命名目录并同步调整此处枚举键（详见 HeroServiceNet/Config 中的同款 TODO）
export const CharacterEnum: any = {  }

export const RegisterCharacter: ((option: Option) => ClassDecorator) = (option) => {
    return (target: any) => {
        CharacterEnum[option.id] = target.getCharacterMateData(option.id)
    }
}