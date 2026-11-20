import {SkillMateState} from "../../../common/game/skill/SkillMateState";
import {RegisterSkill} from "../../../common/game/skill/SkillEnum";
import {getConfig, stockConfig} from "../../../common/Config";
import {CharacterEnum} from "../../../common/game/character/CharacterEnum";
import {EquipmentEnum} from "../../../common/game/equipment/EquipmentEnum";

@RegisterSkill({id: "001"})
export class Skill extends SkillMateState{

    name = "‌妖术"

    canUse = true

    description = `可以控制一个敌方单位，使其无法执行任何行动，持续时间为40秒`

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
