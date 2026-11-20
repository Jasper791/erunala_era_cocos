import {EquipmentMateState} from "../../../common/game/equipment/EquipmentMateState";
import {RegisterEquipment} from "../../../common/game/equipment/EquipmentEnum";
import {Resource} from "../../../common/Config";

@RegisterEquipment({id: "004"})
export class Equipment extends EquipmentMateState {

    name = "铁锹"

    description = "对新手来说再适合不过了"

    type:  "helmet"|"weapon"|"decorate"|"shoe" = "weapon"

    attack_growth = 5

    pierce_growth = 2

    worth: Resource = {
        gold: 5 ,
        diamond: 0 ,
        soul: 0
    }
}
