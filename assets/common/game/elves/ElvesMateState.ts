import type { ElvesComponent } from "../../../resources/prefab-resource/ElvesComponent";
import { getLevelFromRare, UnitMateState } from "../UnitMateState";

export { getLevelFromRare }

export class ElvesMateState extends UnitMateState<ElvesComponent> {
    // 创建当前精灵元数据对象
    static getElvesMateData(id: string): ElvesMateState {
        const r = new this()
        r.id = id
        return r
    }
}
