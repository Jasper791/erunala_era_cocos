import {ItemMateState} from "../../../common/game/item/ItemMateState";
import {RegisterItem} from "../../../common/game/item/ItemEnum";
import {getConfig, stockConfig} from "../../../common/Config";
import {CharacterEnum} from "../../../common/game/character/CharacterEnum";
import {EquipmentEnum} from "../../../common/game/equipment/EquipmentEnum";

@RegisterItem({id: "002"})
export class Item extends ItemMateState{

    name = "生命剂"

    canUse = true

    description = `补充 血量 200`

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
