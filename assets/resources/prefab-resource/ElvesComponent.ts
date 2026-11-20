import { _decorator } from 'cc';
import { ElvesEnum } from '../../common/game/elves/ElvesEnum';
import { ElvesState } from '../../common/game/elves/ElvesState';
import { UnitMateState } from '../../common/game/UnitMateState';
import { UnitState } from '../../common/game/UnitState';
import type { FightMapComponent } from '../../script/fight/FightComponent';
import { BaseUnitComponent, UnitAnimationName, UnitCreateData } from './BaseUnitComponent';
const { ccclass } = _decorator;

@ccclass('ElvesComponent')
export class ElvesComponent extends BaseUnitComponent {

    // 精灵的待机动作名
    protected restAnimation: UnitAnimationName = "standby_loop"

    // 精灵资源里受伤动画叫 hit（没有 hurt/dead，dead 由防御逻辑跳过直接隐藏）
    protected hurtAnimation: UnitAnimationName = "hit"

    protected get resourceDir(): string { return "elves-resource" }

    protected getMateData(id: string): UnitMateState<any> { return ElvesEnum[id] }

    protected createState(data: UnitCreateData): UnitState<any> {
        return ElvesState.createState(
            data.lv ,
            ElvesEnum[data.id] ,
            data.equipments || [] ,
            data.extra || {} ,
            data.star || 1
        )
    }

    public getOwnLiveQueue(fightMap: FightMapComponent): Set<any> { return fightMap.allLiveElvesQueue }

    protected getOwnDeadQueue(fightMap: FightMapComponent): Set<any> { return fightMap.allDeadElvesQueue }

}