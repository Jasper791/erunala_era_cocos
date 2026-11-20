import { CharacterCreateData } from "./game/character/CharacterCreateData"
import { ElvesCreateData } from "./game/elves/ElvesCreateData"
import { EquipmentEnum } from "./game/equipment/EquipmentEnum"
import { EquipmentMateState } from "./game/equipment/EquipmentMateState"
import {EquipmentCreateData} from "./game/equipment/EquipmentCreateData";
import type { FightMapComponent } from "../script/fight/FightComponent";

export class FightReward {
    getExp: (fightMap: FightMapComponent) => number = () => 0
    getSoul: (fightMap: FightMapComponent) => number = () => 0
    getGold: (fightMap: FightMapComponent) => number = () => 0
    getDiamond: (fightMap: FightMapComponent) => number = () => 0
    getEquipments: ((fightMap: FightMapComponent) => (EquipmentCreateData[])) = () => {return <any>[]}
}

export class Common {

    public fightReward = new FightReward

    public rightCharacterQueue: CharacterCreateData[] = []

    public leftCharacterQueue: CharacterCreateData[] = []

    public rightElvesQueue: ElvesCreateData[] = []

    public leftElvesQueue: ElvesCreateData[] = []

}

export const common = new Common