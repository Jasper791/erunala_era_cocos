import {ItemMateState} from "../../../common/game/item/ItemMateState";
import {RegisterItem} from "../../../common/game/item/ItemEnum";
import {getConfig, stockConfig} from "../../../common/Config";
import {CharacterEnum} from "../../../common/game/character/CharacterEnum";
import {EquipmentEnum} from "../../../common/game/equipment/EquipmentEnum";

@RegisterItem({id: "001"})
export class Item extends ItemMateState{

    name = "作弊道具"

    canUse = true

    description = `一个作弊道具,用吧,反正你也不是来体验游戏的,你只顾自己爽`

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
