import { _decorator } from 'cc';
import { CharacterEnum } from '../../common/game/character/CharacterEnum';
import { CharacterState } from '../../common/game/character/CharacterState';
import { UnitMateState } from '../../common/game/UnitMateState';
import { UnitState } from '../../common/game/UnitState';
import type { FightMapComponent } from '../../script/fight/FightComponent';
import { BaseUnitComponent, UnitCreateData } from './BaseUnitComponent';
const { ccclass } = _decorator;

@ccclass('CharacterComponent')
export class CharacterComponent extends BaseUnitComponent {

    protected get resourceDir(): string { return "character-resource" }

    protected getMateData(id: string): UnitMateState<any> { return CharacterEnum[id] }

    protected createState(data: UnitCreateData): UnitState<any> {
        return CharacterState.createState(
            data.lv ,
            CharacterEnum[data.id] ,
            data.equipments || [] ,
            data.extra || {} ,
            data.star || 1
        )
    }

    public getOwnLiveQueue(fightMap: FightMapComponent): Set<any> { return fightMap.allLiveCharacterQueue }

    protected getOwnDeadQueue(fightMap: FightMapComponent): Set<any> { return fightMap.allDeadCharacterQueue }

}