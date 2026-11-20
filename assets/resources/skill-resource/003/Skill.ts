import {SkillMateState} from "../../../common/game/skill/SkillMateState";
import {RegisterSkill} from "../../../common/game/skill/SkillEnum";
import {getConfig, stockConfig} from "../../../common/Config";
import {CharacterEnum} from "../../../common/game/character/CharacterEnum";
import {EquipmentEnum} from "../../../common/game/equipment/EquipmentEnum";

@RegisterSkill({id: "003"})
export class Skill extends SkillMateState{

    name = "医疗波"

    canUse = true

    description = `可以同时为多个友军单位恢复生命值`

    getOnUse(): () => any {
        return async () => {
            const config = getConfig()
            Object.keys(CharacterEnum).forEach((id) => config.userData.addNewCharacter({id , lv: 1}))
            Object.keys(EquipmentEnum).forEach((id) => config.userData.addNewEquipment(id , 1))
            config.userData.gold += 10000000
            config.userData.diamond += 1000000
            config.userData.soul += 10000000
            stockConfig()
        }
    }

}
