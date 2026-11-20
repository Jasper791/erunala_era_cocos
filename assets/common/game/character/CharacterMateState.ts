import type { CharacterComponent } from "../../../resources/prefab-resource/CharacterComponent";
import { getLevelFromRare, UnitMateState } from "../UnitMateState";

export { getLevelFromRare }

export class CharacterMateState extends UnitMateState<CharacterComponent> {
    // 创建当前角色元数据对象
    static getCharacterMateData(id: string): CharacterMateState {
        const r = new this()
        r.id = id
        return r
    }
}
